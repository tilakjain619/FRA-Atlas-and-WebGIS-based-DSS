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
        # Check if input is already structured data (JSON) or raw text
        if isinstance(request.extracted_text, dict):
            # Input is already structured JSON data
            extracted_data = request.extracted_text
            processing_method = "Direct JSON input"
        elif isinstance(request.extracted_text, str):
            # Input is raw text, need AI processing
            if not openrouter_service.api_key:
                raise HTTPException(
                    status_code=500,
                    detail="OpenRouter API key not configured for text processing"
                )
            extracted_data = await openrouter_service.extract_claim_data(request.extracted_text)
            processing_method = "AI text processing"
        else:
            raise HTTPException(
                status_code=400,
                detail="extracted_text must be either a string or a JSON object"
            )
        
        # Map extracted data to Claim model with defaults for required fields
        try:
            claim_data = {
                "claimant_name": str(extracted_data.get("claimant_name") or "Unknown").strip(),
                "state": str(extracted_data.get("state") or "Unknown").strip(),
                "district": str(extracted_data.get("district") or "Unknown").strip(),
                "village": str(extracted_data.get("village") or "Unknown").strip(),
                "claim_type": str(extracted_data.get("claim_type") or "individual").strip().lower(),
                "area": parse_area_value(extracted_data.get("area")),
            }
            
            # Validate claim_type
            if claim_data["claim_type"] not in ["individual", "community"]:
                claim_data["claim_type"] = "individual"
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error mapping extracted data to claim fields: {str(e)}"
            )
        
        # Create and validate Claim object
        try:
            claim = Claim(**claim_data)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error validating claim data: {str(e)}. Claim data: {claim_data}"
            )
        
        # Store in database with full metadata
        claim_dict = claim.dict()
        claim_dict["extracted_metadata"] = extracted_data  # Store full extracted data
        claim_dict["processing_method"] = processing_method
        result = await db["claims"].insert_one(claim_dict)
        
        return {
            "success": True,
            "claim_id": str(result.inserted_id),
            "processing_method": processing_method,
            "extracted_data": extracted_data,
            "stored_claim": claim_data,
            "message": "Claim created successfully"
        }
    
    except Exception as e:
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
