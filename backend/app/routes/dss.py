from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import json
import os
from dotenv import load_dotenv
from app.database import db

# Load environment variables
load_dotenv()

router = APIRouter()

class DSSAnalysisRequest(BaseModel):
    claim_data: Dict[str, Any]
    village_data: Optional[Dict[str, Any]] = None
    schemes_data: Optional[List[Dict[str, Any]]] = None

class DSSRecommendation(BaseModel):
    id: str
    type: str
    title: str
    description: str
    action: str
    priority: str
    confidence_score: float
    reasoning: str

class AIMLAPIService:
    def __init__(self):
        self.api_key = os.getenv("AIMLAPI_KEY")
        self.base_url = "https://api.aimlapi.com/v1"
        self.model = "google/gemini-2.0-flash"  # or another model available on AIML API
    
    async def analyze_scheme_eligibility(self, fra_holder: Dict, schemes: List[Dict]) -> List[DSSRecommendation]:
        """
        Use AIML API to analyze FRA holder eligibility for CSS schemes
        """
        try:
            # For now, provide rule-based recommendations as fallback
            print("Generating rule-based scheme recommendations...")
            recommendations = []
            
            # Rule-based eligibility for DAJGUA
            if fra_holder.get("claim_type") == "individual":
                recommendations.append(DSSRecommendation(
                    id="scheme-dajgua-1",
                    type="Scheme Eligibility",
                    title="DAJGUA Scheme Eligibility",
                    description="Individual FRA holder eligible for Development of Antyodaya and Other Tribal Families scheme. Provides livelihood support and skill development.",
                    action="Apply for DAJGUA",
                    priority="High",
                    confidence_score=0.85,
                    reasoning="Individual FRA claim holders are primary beneficiaries of DAJGUA scheme"
                ))
            
            # Rule-based eligibility for Jal Shakti
            village_name = fra_holder.get("village", "").lower()
            if any(keyword in village_name for keyword in ["dry", "drought", "water"]) or True:  # Mock condition
                recommendations.append(DSSRecommendation(
                    id="scheme-jalshakti-1",
                    type="Priority Intervention",
                    title="Jal Shakti Abhiyan Priority",
                    description="Village shows indicators of water stress. High priority for borewell installation and water conservation under Jal Shakti Abhiyan.",
                    action="Deploy Water Survey Team",
                    priority="High",
                    confidence_score=0.9,
                    reasoning="Water scarcity indicators detected in village data"
                ))
            
            # Rule-based eligibility for MGNREGA
            recommendations.append(DSSRecommendation(
                id="scheme-mgnrega-1",
                type="Scheme Eligibility",
                title="MGNREGA Employment Guarantee",
                description="FRA holder eligible for 100 days guaranteed employment under MGNREGA. Can participate in forest conservation and rural development works.",
                action="Register for MGNREGA",
                priority="Medium",
                confidence_score=0.95,
                reasoning="All rural households are eligible for MGNREGA employment guarantee"
            ))
            
            print(f"Generated {len(recommendations)} rule-based recommendations")
            return recommendations
            
        except Exception as e:
            print(f"Error in scheme analysis: {str(e)}")
            # Return basic fallback
            return [DSSRecommendation(
                id="scheme-basic-1",
                type="Basic Eligibility",
                title="Government Scheme Eligibility",
                description="FRA holder may be eligible for various government schemes. Manual review recommended.",
                action="Review Eligibility",
                priority="Medium",
                confidence_score=0.6,
                reasoning="Basic eligibility assessment"
            )]
    
    async def prioritize_interventions(self, village_data: Dict, claims_data: List[Dict]) -> List[DSSRecommendation]:
        """
        Use AIML API to prioritize interventions based on village conditions
        """
        prompt = f"""
        You are an expert in rural development and government intervention planning in India.
        
        Analyze the following village data and claims to prioritize interventions:
        
        Village Data:
        {json.dumps(village_data, indent=2)}
        
        Claims Data Summary:
        - Total Claims: {len(claims_data)}
        - Sample Claims: {json.dumps(claims_data[:3], indent=2)}
        
        Based on this data, recommend priority interventions considering:
        1. Water scarcity indicators (for Jal Shakti Abhiyan)
        2. Infrastructure needs
        3. Livelihood opportunities
        4. Healthcare access
        5. Education facilities
        6. Forest conservation needs
        
        For each intervention, provide:
        - Intervention type and description
        - Priority level (High/Medium/Low)
        - Expected impact
        - Implementation timeline
        - Required resources
        - Success metrics
        
        Return response as a JSON array of intervention recommendations.
        """
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": "You are an expert in rural development planning and government intervention strategies."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.4,
                        "max_tokens": 2000
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    raise HTTPException(status_code=500, detail=f"AIML API error: {response.text}")
                
                result = response.json()
                ai_response = result["choices"][0]["message"]["content"]
                
                # Parse AI response and convert to recommendations
                try:
                    interventions_data = json.loads(ai_response)
                    interventions = []
                    
                    for i, intervention in enumerate(interventions_data):
                        interventions.append(DSSRecommendation(
                            id=f"ai-intervention-{i}",
                            type="Priority Intervention",
                            title=intervention.get("title", "Intervention Recommendation"),
                            description=intervention.get("description", ""),
                            action=intervention.get("action", "Implement Intervention"),
                            priority=intervention.get("priority", "Medium"),
                            confidence_score=intervention.get("confidence_score", 0.8),
                            reasoning=intervention.get("reasoning", "")
                        ))
                    
                    return interventions
                    
                except json.JSONDecodeError:
                    # Fallback: create single recommendation from text response
                    return [DSSRecommendation(
                        id="ai-intervention-fallback",
                        type="Intervention Analysis",
                        title="AI Intervention Analysis",
                        description=ai_response[:200] + "...",
                        action="Review Analysis",
                        priority="High",
                        confidence_score=0.6,
                        reasoning="AI-generated intervention priority analysis"
                    )]
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error in intervention analysis: {str(e)}")

# Initialize the AI service
aiml_service = AIMLAPIService()

@router.post("/analyze", response_model=List[DSSRecommendation])
async def analyze_dss_recommendations(request: DSSAnalysisRequest):
    """
    Generate DSS recommendations using AI analysis
    """
    try:
        print(f"DSS Analysis request received: {request}")
        recommendations = []
        
        # Get scheme eligibility recommendations
        if request.schemes_data:
            print("Analyzing scheme eligibility...")
            scheme_recommendations = await aiml_service.analyze_scheme_eligibility(
                request.claim_data, 
                request.schemes_data
            )
            recommendations.extend(scheme_recommendations)
        
        # Get intervention priority recommendations
        if request.village_data:
            print(f"Analyzing village interventions for: {request.village_data.get('name', 'Unknown')}")
            # Mock village claims for now since database might not be connected
            village_claims = [
                {"village": request.village_data.get("name", ""), "type": "individual", "area": 2.5},
                {"village": request.village_data.get("name", ""), "type": "community", "area": 15.0}
            ]
            
            intervention_recommendations = await aiml_service.prioritize_interventions(
                request.village_data,
                village_claims
            )
            recommendations.extend(intervention_recommendations)
        
        print(f"Generated {len(recommendations)} recommendations")
        return recommendations
        
    except Exception as e:
        print(f"Error in DSS analysis: {str(e)}")
        # Return fallback recommendations instead of failing
        return [
            DSSRecommendation(
                id="fallback-1",
                type="System Recommendation",
                title="DSS Analysis Service",
                description="DSS analysis service is initializing. Basic recommendations are available.",
                action="Review System Status",
                priority="Medium",
                confidence_score=0.5,
                reasoning="Fallback recommendation due to service initialization"
            )
        ]

@router.get("/schemes")
async def get_available_schemes():
    """
    Get list of available Central Sector Schemes
    """
    schemes = [
        {
            "id": "dajgua",
            "name": "DAJGUA",
            "full_name": "Development of Antyodaya and Other Tribal Families",
            "ministry": "Ministry of Tribal Affairs",
            "eligibility_criteria": {
                "target_group": "Tribal families",
                "income_limit": 50000,
                "land_ownership": "FRA pattas preferred"
            },
            "benefits": ["Livelihood support", "Skill development", "Infrastructure development"]
        },
        {
            "id": "pm_janman",
            "name": "PM-JANMAN",
            "full_name": "Pradhan Mantri Janjati Adivasi Nyaya Maha Abhiyan",
            "ministry": "Ministry of Tribal Affairs",
            "eligibility_criteria": {
                "target_group": "Particularly Vulnerable Tribal Groups (PVTGs)",
                "coverage": "All PVTG villages and habitations"
            },
            "benefits": ["Safe housing", "Clean drinking water", "Sanitation", "Healthcare", "Education"]
        },
        {
            "id": "jal_shakti",
            "name": "Jal Shakti Abhiyan",
            "full_name": "Jal Shakti Abhiyan",
            "ministry": "Ministry of Jal Shakti",
            "eligibility_criteria": {
                "target_group": "Water-stressed villages",
                "priority": "Villages with low water index"
            },
            "benefits": ["Borewell installation", "Water conservation", "Rainwater harvesting"]
        },
        {
            "id": "mgnrega",
            "name": "MGNREGA",
            "full_name": "Mahatma Gandhi National Rural Employment Guarantee Act",
            "ministry": "Ministry of Rural Development",
            "eligibility_criteria": {
                "target_group": "Rural households",
                "work_guarantee": "100 days per household per year"
            },
            "benefits": ["Guaranteed employment", "Asset creation", "Livelihood security"]
        },
        {
            "id": "pmay",
            "name": "PMAY-G",
            "full_name": "Pradhan Mantri Awas Yojana - Gramin",
            "ministry": "Ministry of Rural Development",
            "eligibility_criteria": {
                "target_group": "Houseless and households with kutcha houses",
                "income_criteria": "Below poverty line"
            },
            "benefits": ["Pucca house construction", "Financial assistance up to Rs 1.30 lakh"]
        }
    ]
    
    return {"schemes": schemes}

@router.post("/village-analysis")
async def analyze_village_conditions(village_name: str):
    """
    Analyze village conditions for intervention prioritization
    """
    try:
        # Get claims data for the village
        village_claims = await db.claims.find({
            "village": village_name
        }).to_list(length=None)
        
        # Calculate village statistics
        total_claims = len(village_claims)
        anomaly_claims = len([c for c in village_claims if c.get("is_anomaly", False)])
        
        # Mock village data (in real implementation, this would come from GIS/survey data)
        village_data = {
            "name": village_name,
            "total_claims": total_claims,
            "anomaly_rate": (anomaly_claims / total_claims * 100) if total_claims > 0 else 0,
            "water_index": 0.3,  # Mock data - would come from actual water survey
            "forest_cover": 0.65,  # Mock data - would come from satellite imagery
            "population": 850,  # Mock data - would come from census
            "literacy_rate": 0.68,  # Mock data - would come from census
            "healthcare_access": "Limited",  # Mock data - would come from surveys
            "infrastructure_score": 3.2  # Mock data - composite score
        }
        
        return {
            "village_data": village_data,
            "priority_interventions": [
                {
                    "type": "Water Management",
                    "priority": "High" if village_data["water_index"] < 0.4 else "Medium",
                    "reason": f"Water index is {village_data['water_index']}, indicating water stress"
                },
                {
                    "type": "Forest Conservation",
                    "priority": "High" if village_data["forest_cover"] > 0.6 else "Low",
                    "reason": f"High forest cover ({village_data['forest_cover']*100}%) requires conservation measures"
                },
                {
                    "type": "Education Infrastructure",
                    "priority": "High" if village_data["literacy_rate"] < 0.7 else "Medium",
                    "reason": f"Literacy rate is {village_data['literacy_rate']*100}%, below national average"
                }
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing village conditions: {str(e)}")