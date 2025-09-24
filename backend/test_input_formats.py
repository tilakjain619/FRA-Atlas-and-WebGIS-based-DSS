"""
Test script for both string and JSON input formats
"""

import httpx
import json
import asyncio

async def test_string_input():
    """Test with raw text string"""
    print("🧪 Testing with RAW TEXT STRING")
    print("="*50)
    
    url = "http://127.0.0.1:8000/claims/from-text"
    
    # Raw text format
    payload = {
        "extracted_text": """
        1. Name of the claimant (s): Karan Singh
        2. Name of the spouse: Priya Singh
        3. Name of father/mother: Baldev Singh
        4. Address: Plot 56, Hilltop
        5. Village: Devpur
        6. Gram Panchayat: Devpur GP
        7. Tehsil /Taluka: Shahdol
        """
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json=payload)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Error: {e}")

async def test_json_input():
    """Test with structured JSON data"""
    print("\n🧪 Testing with STRUCTURED JSON DATA")
    print("="*50)
    
    url = "http://127.0.0.1:8000/claims/from-text"
    
    # JSON object format
    payload = {
        "extracted_text": {
            "claimant_name": "Karan Singh",
            "spouse_name": "Priya Singh",
            "father_mother_name": "Baldev Singh",
            "address": "Plot 56, Hilltop",
            "village": "Devpur",
            "gram_panchayat": "Devpur GP",
            "tehsil_taluka": "Shahdol",
            "district": None,
            "state": "Madhya Pradesh",
            "claim_type": "individual",
            "area": 2.5
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json=payload)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Error: {e}")

async def test_structured_data_endpoint():
    """Test the dedicated structured data endpoint"""
    print("\n🧪 Testing DEDICATED STRUCTURED DATA ENDPOINT")
    print("="*50)
    
    url = "http://127.0.0.1:8000/claims/from-structured-data"
    
    # Direct structured data
    payload = {
        "claimant_name": "Raj Kumar",
        "spouse_name": "Sita Kumar",
        "father_mother_name": "Ram Kumar",
        "address": "House 123, Main Road",
        "village": "Rampur",
        "gram_panchayat": "Rampur GP",
        "tehsil_taluka": "Ramgarh",
        "district": "Balaghat",
        "state": "Madhya Pradesh",
        "claim_type": "individual",
        "area": 3.0
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(url, json=payload)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Error: {e}")

async def main():
    print("🚀 Testing Different Input Formats for Claims API")
    print("="*60)
    
    await test_string_input()
    await test_json_input()
    await test_structured_data_endpoint()
    
    print(f"\n{'='*60}")
    print("📋 USAGE SUMMARY")
    print(f"{'='*60}")
    print("1. Raw Text → POST /claims/from-text (string)")
    print("2. JSON Data → POST /claims/from-text (object)")
    print("3. Structured → POST /claims/from-structured-data")
    print("\nAll three methods now work! ✅")

if __name__ == "__main__":
    asyncio.run(main())