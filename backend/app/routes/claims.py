from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Union, Any, Dict
import httpx
import json
import os
from dotenv import load_dotenv
from ..models.claim import Claim
from app.database import db

# Load environment variables
load_dotenv()

router = APIRouter()

class ClaimProcessingRequest(BaseModel):
    extracted_text: Union[str, Dict[str, Any]] = Field(..., description="Either raw text string or structured JSON object")

class OpenRouterService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "google/gemini-2.0-flash-exp:free"
    
    async def extract_claim_data(self, text: str) -> dict:
        """
        Use OpenRouter Gemini to extract structured data from claim form text
        """
        prompt = f"""
        Extract the following information from this Forest Rights Act claim form text and return it as a JSON object.
        
        Required fields to extract:
        - claimant_name: Name of the person making the claim
        - spouse_name: Name of spouse (if mentioned)
        - father_mother_name: Name of father or mother
        - address: Physical address
        - village: Village name
        - gram_panchayat: Gram Panchayat name
        - tehsil_taluka: Tehsil or Taluka name
        - district: District name (if mentioned)
        - state: State name (if mentioned)
        - claim_type: "individual" or "community" (infer from context)
        - area: Any land area mentioned. If multiple areas are listed, provide the complete text (e.g., "0.4 ha (habitation), 1.3 ha (self-cultivation)"). If single area, provide just the number with unit (e.g., "2.5 ha"). Use null if no area mentioned.
        
        Text to process:
        {text}
        
        Return only a valid JSON object with the extracted data. Use null for fields not found.
        For area field, preserve the full text as written in the document - our system will parse it automatically.
        Example format:
        {{
            "claimant_name": "Karan Singh",
            "spouse_name": "Priya Singh",
            "father_mother_name": "Baldev Singh",
            "address": "Plot 56, Hilltop",
            "village": "Devpur",
            "gram_panchayat": "Devpur GP",
            "tehsil_taluka": "Shahdol",
            "district": null,
            "state": null,
            "claim_type": "individual",
            "area": "2.5 ha"
        }}
        """
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.1,
            "max_tokens": 1000
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"OpenRouter API error: {response.text}"
                )
            
            result = response.json()
            
            # Extract the content from the response
            content = result["choices"][0]["message"]["content"]
            
            # Try to parse the JSON response
            try:
                extracted_data = json.loads(content)
                return extracted_data
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract JSON from the content
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    try:
                        extracted_data = json.loads(json_match.group())
                        return extracted_data
                    except json.JSONDecodeError:
                        pass
                
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to parse AI response as JSON: {content}"
                )

# Helper function to parse area from complex strings
def parse_area_value(area_input) -> float:
    """
    Parse area value from various formats:
    - Simple numbers: "2.5" -> 2.5
    - With units: "2.5 ha" -> 2.5
    - Complex: "0.4 ha (habitation), 1.3 ha (self-cultivation)" -> 1.7 (sum)
    - Invalid: anything else -> 0.0
    """
    if not area_input:
        return 0.0
    
    # If it's already a number, return it
    if isinstance(area_input, (int, float)):
        return float(area_input)
    
    # Convert to string and clean up
    area_str = str(area_input).strip().lower()
    
    if not area_str:
        return 0.0
    
    # Try simple float conversion first
    try:
        return float(area_str)
    except ValueError:
        pass
    
    # Extract all numeric values from the string
    import re
    numbers = re.findall(r'\d+\.?\d*', area_str)
    
    if not numbers:
        return 0.0
    
    # If multiple numbers found, sum them up (for cases like "0.4 ha (habitation), 1.3 ha (self-cultivation)")
    try:
        total_area = sum(float(num) for num in numbers)
        return total_area
    except ValueError:
        return 0.0

# Initialize the service
openrouter_service = OpenRouterService()

@router.post("/claims/")
async def process_and_create_claim(request: ClaimProcessingRequest):
    """
    Main route: Process text (string or JSON) and create claim in database.
    Handles both raw text (with AI processing) and structured JSON data.
    """
    try:
        print(f"Received request: {request}")  # Debug logging
        # Check if input is already structured data (JSON) or raw text
        if isinstance(request.extracted_text, dict):
            # Input is already structured JSON data
            extracted_data = request.extracted_text
            processing_method = "Direct JSON input"
            print(f"Processing structured JSON data: {extracted_data}")
        elif isinstance(request.extracted_text, str):
            # Input is raw text, need AI processing
            print(f"Processing raw text: {request.extracted_text[:100]}...")
            if not openrouter_service.api_key:
                print("WARNING: OpenRouter API key not configured")
                # For testing, create mock data instead of failing
                extracted_data = {
                    "claimant_name": "Test User",
                    "state": "Unknown",
                    "district": "Unknown", 
                    "village": "Unknown",
                    "claim_type": "individual",
                    "area": "0"
                }
                processing_method = "Mock processing (no API key)"
            else:
                extracted_data = await openrouter_service.extract_claim_data(request.extracted_text)
                processing_method = "AI text processing"
        else:
            raise HTTPException(
                status_code=400,
                detail="extracted_text must be either a string or a JSON object"
            )
        
        # Map extracted data to Claim model with defaults for required fields
        try:
            print(f"Mapping extracted data: {extracted_data}")
            
            claim_data = {
                "claimant_name": str(extracted_data.get("claimant_name") or "Unknown").strip(),
                "state": str(extracted_data.get("state") or "Unknown").strip(),
                "district": str(extracted_data.get("district") or "Unknown").strip(),
                "village": str(extracted_data.get("village") or "Unknown").strip(),
                "claim_type": str(extracted_data.get("claim_type") or "individual").strip().lower(),
                "area": parse_area_value(extracted_data.get("area")),
                "is_anomaly": extracted_data.get("is_anomaly", False),  # Default to False
            }
            
            # Validate claim_type
            if claim_data["claim_type"] not in ["individual", "community"]:
                claim_data["claim_type"] = "individual"
            
            print(f"Mapped claim data: {claim_data}")
            
        except Exception as e:
            print(f"Error in data mapping: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error mapping extracted data to claim fields: {str(e)}. Extracted data: {extracted_data}"
            )
        
        # Create and validate Claim object
        try:
            print("Creating Claim object...")
            claim = Claim(**claim_data)
            print(f"Claim object created successfully: {claim}")
        except Exception as e:
            print(f"Error creating Claim object: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Error validating claim data: {str(e)}. Claim data: {claim_data}"
            )
        
        # Store in database with full metadata
        try:
            print("Storing in database...")
            claim_dict = claim.dict()
            claim_dict["extracted_metadata"] = extracted_data  # Store full extracted data
            claim_dict["processing_method"] = processing_method
            print(f"Claim dict to store: {claim_dict}")
            result = await db["claims"].insert_one(claim_dict)
            print(f"Database insert result: {result.inserted_id}")
        except Exception as e:
            print(f"Database error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {str(e)}"
            )
        
        return {
            "success": True,
            "claim_id": str(result.inserted_id),
            "processing_method": processing_method,
            "extracted_data": extracted_data,
            "stored_claim": claim_data,
            "message": "Claim created successfully"
        }
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing and creating claim: {str(e)}"
        )

@router.get("/claims/")
async def get_all_claims():
    """Retrieve all claims from the database"""
    try:
        claims = []
        async for claim in db["claims"].find():
            claim["_id"] = str(claim["_id"])  # Convert ObjectId to string
            claims.append(claim)
        
        return {
            "success": True,
            "claims": claims,
            "count": len(claims)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving claims: {str(e)}"
        )

def serialize_for_json(obj):
    """Helper function to serialize objects for JSON"""
    if hasattr(obj, 'isoformat'):  # datetime object
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: serialize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_json(item) for item in obj]
    else:
        return obj

class AIMLAPIService:
    def __init__(self):
        self.api_key = os.getenv("AIMLAPI_KEY")
        self.base_url = "https://api.aimlapi.com/v1"
    
    async def detect_anomalies(self, claims_data: list) -> dict:
        """
        Use AI/ML API to detect anomalies in claims data
        """
        if not self.api_key:
            # Return mock results if no API key
            return self._generate_mock_anomalies(claims_data)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Prepare data for AI analysis - serialize all datetime objects
        analysis_data = []
        for claim in claims_data:
            claim_data = {
                "claim_id": claim.get("_id"),
                "claimant_name": claim.get("claimant_name"),
                "area": claim.get("area", 0),
                "village": claim.get("village"),
                "district": claim.get("district"),
                "state": claim.get("state"),
                "claim_type": claim.get("claim_type"),
                "submission_date": claim.get("submission_date"),
                "extracted_metadata": claim.get("extracted_metadata", {})
            }
            # Serialize all datetime objects to strings
            serialized_claim = serialize_for_json(claim_data)
            analysis_data.append(serialized_claim)
        
        payload = {
            "model": "gpt-4o-mini",  # Using a suitable model for analysis
            "messages": [
                {
                    "role": "system",
                    "content": """You are an AI system specialized in detecting anomalies in Forest Rights Act claims. 
                    Analyze the provided claims data and identify potential issues such as:
                    1. Unusually large or small land areas
                    2. Duplicate or similar claimant names
                    3. Inconsistent geographical data
                    4. Suspicious patterns in submission dates
                    5. Data quality issues
                    
                    Return a JSON response with detected anomalies, confidence scores, and recommendations."""
                },
                {
                    "role": "user", 
                    "content": f"Analyze these FRA claims for anomalies: {json.dumps(analysis_data[:10])}"  # Limit to first 10 for API efficiency
                }
            ],
            "temperature": 0.1,
            "max_tokens": 2000
        }
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    print(f"AI/ML API error: {response.status_code} - {response.text}")
                    return self._generate_mock_anomalies(claims_data)
                
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Try to parse the JSON response
                try:
                    anomalies_data = json.loads(content)
                    return anomalies_data
                except json.JSONDecodeError:
                    # If JSON parsing fails, extract JSON from content
                    import re
                    json_match = re.search(r'\{.*\}', content, re.DOTALL)
                    if json_match:
                        try:
                            anomalies_data = json.loads(json_match.group())
                            return anomalies_data
                        except json.JSONDecodeError:
                            pass
                    
                    return self._generate_mock_anomalies(claims_data)
        
        except Exception as e:
            print(f"Error calling AI/ML API: {str(e)}")
            return self._generate_mock_anomalies(claims_data)
    
    def _generate_mock_anomalies(self, claims_data: list) -> dict:
        """Generate mock anomaly detection results for testing"""
        anomalies = []
        
        for i, claim in enumerate(claims_data[:5]):  # Analyze first 5 claims
            # Simple heuristic-based anomaly detection
            area = claim.get("area", 0)
            claimant_name = claim.get("claimant_name", "")
            
            if area > 10:  # Large area anomaly
                anomalies.append({
                    "id": len(anomalies) + 1,
                    "claim_id": claim.get("_id"),
                    "type": "Large Area Claim",
                    "severity": "High" if area > 20 else "Medium",
                    "confidence": 85.5 + (i * 2),
                    "description": f"Unusually large land area claim of {area} hectares detected",
                    "claimant_name": claimant_name,
                    "area": area,
                    "timestamp": serialize_for_json(claim.get("submission_date", "")),
                    "status": "Pending Review"
                })
            
            if area < 0.1 and area > 0:  # Small area anomaly
                anomalies.append({
                    "id": len(anomalies) + 1,
                    "claim_id": claim.get("_id"),
                    "type": "Suspicious Small Area",
                    "severity": "Medium",
                    "confidence": 76.8 + (i * 1.5),
                    "description": f"Unusually small land area claim of {area} hectares detected",
                    "claimant_name": claimant_name,
                    "area": area,
                    "timestamp": serialize_for_json(claim.get("submission_date", "")),
                    "status": "Under Review"
                })
        
        return {
            "anomalies": anomalies,
            "summary": {
                "total_analyzed": len(claims_data),
                "anomalies_found": len(anomalies),
                "high_risk": len([a for a in anomalies if a["severity"] == "High"]),
                "medium_risk": len([a for a in anomalies if a["severity"] == "Medium"]),
                "low_risk": len([a for a in anomalies if a["severity"] == "Low"])
            }
        }

# Initialize AI service
aiml_service = AIMLAPIService()

@router.post("/claims/detect-anomalies")
async def detect_claim_anomalies():
    """
    Analyze all claims for anomalies using AI/ML API
    """
    try:
        # Get all claims from database
        claims = []
        async for claim in db["claims"].find():
            claim["_id"] = str(claim["_id"])
            claims.append(claim)
        
        if not claims:
            return {
                "success": True,
                "message": "No claims found for analysis",
                "anomalies": [],
                "summary": {
                    "total_analyzed": 0,
                    "anomalies_found": 0,
                    "high_risk": 0,
                    "medium_risk": 0,
                    "low_risk": 0
                }
            }
        
        # Detect anomalies using AI
        result = await aiml_service.detect_anomalies(claims)
        
        # Update claims with anomaly flags if high confidence anomalies found
        high_confidence_anomalies = [
            a for a in result.get("anomalies", []) 
            if a.get("confidence", 0) > 80
        ]
        
        for anomaly in high_confidence_anomalies:
            claim_id = anomaly.get("claim_id")
            if claim_id:
                try:
                    from bson import ObjectId
                    await db["claims"].update_one(
                        {"_id": ObjectId(claim_id)},
                        {"$set": {"is_anomaly": True, "anomaly_details": anomaly}}
                    )
                except Exception as e:
                    print(f"Error updating anomaly flag for claim {claim_id}: {e}")
        
        return {
            "success": True,
            "anomalies": result.get("anomalies", []),
            "summary": result.get("summary", {}),
            "claims_analyzed": len(claims),
            "updated_anomaly_flags": len(high_confidence_anomalies)
        }
        
    except Exception as e:
        print(f"Error in anomaly detection: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error detecting anomalies: {str(e)}"
        )

@router.get("/claims/anomalies")
async def get_anomalous_claims():
    """
    Get all claims flagged as anomalies
    """
    try:
        anomalous_claims = []
        async for claim in db["claims"].find({"is_anomaly": True}):
            claim["_id"] = str(claim["_id"])
            anomalous_claims.append(claim)
        
        return {
            "success": True,
            "anomalous_claims": anomalous_claims,
            "count": len(anomalous_claims)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving anomalous claims: {str(e)}"
        )

@router.get("/claims/statistics")
async def get_claims_statistics():
    """
    Get comprehensive statistics for dashboard overview
    """
    try:
        # Get all claims
        all_claims = []
        async for claim in db["claims"].find():
            claim["_id"] = str(claim["_id"])
            all_claims.append(claim)
        
        # Calculate statistics
        total_claims = len(all_claims)
        anomaly_claims = len([c for c in all_claims if c.get("is_anomaly", False)])
        individual_claims = len([c for c in all_claims if c.get("claim_type") == "individual"])
        community_claims = len([c for c in all_claims if c.get("claim_type") == "community"])
        
        # Calculate claims by district
        district_stats = {}
        for claim in all_claims:
            district = claim.get("district", "Unknown")
            if district not in district_stats:
                district_stats[district] = {"total": 0, "anomalies": 0}
            district_stats[district]["total"] += 1
            if claim.get("is_anomaly", False):
                district_stats[district]["anomalies"] += 1
        
        # Calculate today's submissions
        from datetime import datetime, timedelta
        today = datetime.now().date()
        today_claims = 0
        for claim in all_claims:
            if claim.get("created_at"):
                try:
                    claim_date = datetime.fromisoformat(claim["created_at"].replace("Z", "+00:00")).date()
                    if claim_date == today:
                        today_claims += 1
                except:
                    pass
        
        return {
            "success": True,
            "statistics": {
                "total_claims": total_claims,
                "anomaly_claims": anomaly_claims,
                "individual_claims": individual_claims,
                "community_claims": community_claims,
                "normal_claims": total_claims - anomaly_claims,
                "today_submissions": today_claims,
                "district_stats": district_stats,
                "anomaly_rate": (anomaly_claims / total_claims * 100) if total_claims > 0 else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating statistics: {str(e)}"
        )
