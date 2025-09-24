"""
Test script for the simplified single-route API
"""

import httpx
import json
import asyncio

async def test_string_input():
    """Test with raw text string"""
    print("🧪 Testing with RAW TEXT STRING")
    print("="*50)
    
    url = "http://127.0.0.1:8000/claims/"
    
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
    
    url = "http://127.0.0.1:8000/claims/"
    
    # JSON object format (your exact example)
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

async def test_get_claims():
    """Test retrieving all claims"""
    print("\n🧪 Testing GET ALL CLAIMS")
    print("="*50)
    
    url = "http://127.0.0.1:8000/claims/"
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(url)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Error: {e}")

async def main():
    print("🚀 Testing Simplified Claims API")
    print("="*60)
    print("📋 Available Routes:")
    print("  POST /claims/ - Process and create claim")
    print("  GET  /claims/ - Get all claims")
    print("="*60)
    
    await test_string_input()
    await test_json_input()
    await test_get_claims()
    
    print(f"\n{'='*60}")
    print("✅ SIMPLIFIED API SUMMARY")
    print(f"{'='*60}")
    print("🎯 Single POST route handles both:")
    print("   • Raw text → AI processing → Database")
    print("   • JSON data → Direct processing → Database")
    print("🎯 Single GET route for retrieving all claims")
    print("🎯 Clean, simple, and efficient! ✨")

if __name__ == "__main__":
    asyncio.run(main())