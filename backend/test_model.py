"""
Test Pydantic model validation directly
"""
from pydantic import BaseModel, Field, ValidationError
from typing import Union, Any, Dict

class TextProcessingRequest(BaseModel):
    extracted_text: Union[str, Dict[str, Any]] = Field(..., description="Either raw text string or structured JSON object")

def test_model_validation():
    print("🧪 Testing Pydantic Model Validation")
    print("="*50)
    
    # Test 1: String input
    try:
        string_data = TextProcessingRequest(extracted_text="This is a test string")
        print("✅ String input validation: SUCCESS")
        print(f"   Type: {type(string_data.extracted_text)}")
    except ValidationError as e:
        print("❌ String input validation: FAILED")
        print(f"   Error: {e}")
    
    # Test 2: Dict input (your exact case)
    try:
        dict_data = TextProcessingRequest(
            extracted_text={
                "claimant_name": "Karan Singh",
                "spouse_name": "Priya Singh",
                "father_mother_name": "Baldev Singh",
                "address": "Plot 56, Hilltop",
                "village": "Devpur",
                "gram_panchayat": "Devpur GP",
                "tehsil_taluka": "Shahdol",
                "district": None,
                "state": None,
                "claim_type": "individual",
                "area": None
            }
        )
        print("✅ Dict input validation: SUCCESS")
        print(f"   Type: {type(dict_data.extracted_text)}")
        print(f"   Content: {dict_data.extracted_text}")
    except ValidationError as e:
        print("❌ Dict input validation: FAILED")
        print(f"   Error: {e}")

if __name__ == "__main__":
    test_model_validation()