from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import json
import os
from dotenv import load_dotenv
from ..models.claim import Claim
from app.database import db

# Load environment variables
load_dotenv()

router = APIRouter()

class TextProcessingRequest(BaseModel):
    extracted_text: str

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
        - area: Any land area mentioned (in hectares or acres)
        
        Text to process:
        {text}
        
        Return only a valid JSON object with the extracted data. Use null for fields not found.
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
            "area": null
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

openrouter_service = OpenRouterService()

@router.post("/claims/process-text")
async def process_claim_text(request: TextProcessingRequest):
    """
    Process extracted text using OpenRouter Gemini and return structured data
    """
    try:
        if not openrouter_service.api_key:
            raise HTTPException(
                status_code=500,
                detail="OpenRouter API key not configured"
            )
        
        # Extract structured data using Gemini
        extracted_data = await openrouter_service.extract_claim_data(request.extracted_text)
        
        return {
            "success": True,
            "extracted_data": extracted_data,
            "message": "Text processed successfully using AI"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing text: {str(e)}"
        )

@router.post("/claims/from-text")
async def create_claim_from_text(request: TextProcessingRequest):
    """
    Process text with AI and create a claim record in the database
    """
    try:
        if not openrouter_service.api_key:
            raise HTTPException(
                status_code=500,
                detail="OpenRouter API key not configured"
            )
        
        # Extract structured data using Gemini
        extracted_data = await openrouter_service.extract_claim_data(request.extracted_text)
        
        # Map to Claim model with defaults for required fields
        claim_data = {
            "claimant_name": extracted_data.get("claimant_name") or "Unknown",
            "state": extracted_data.get("state") or "Unknown",
            "district": extracted_data.get("district") or "Unknown",
            "village": extracted_data.get("village") or "Unknown",
            "claim_type": extracted_data.get("claim_type") or "individual",
            "area": float(extracted_data.get("area") or 0.0),
        }
        
        # Create and validate Claim object
        claim = Claim(**claim_data)
        
        # Store in database
        claim_dict = claim.dict()
        claim_dict["extracted_metadata"] = extracted_data  # Store full extracted data
        result = await db["claims"].insert_one(claim_dict)
        
        return {
            "success": True,
            "claim_id": str(result.inserted_id),
            "extracted_data": extracted_data,
            "stored_claim": claim_data,
            "message": "Claim created successfully from AI-processed text"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating claim from text: {str(e)}"
        )

@router.get("/claims/")
async def get_claims():
    """
    Retrieve all claims from the database
    """
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

@router.post("/claims/")
async def create_claim(claim: Claim):
    """
    Create a claim directly with Claim model data
    """
    claim_dict = claim.dict()
    result = await db["claims"].insert_one(claim_dict)
    return {"id": str(result.inserted_id), "message": "Claim stored successfully"}
async def create_claim(claim: Claim):
    claim_dict = claim.dict()
    result = await db["claims"].insert_one(claim_dict)
    return {"id": str(result.inserted_id), "message": "Claim stored successfully"}
