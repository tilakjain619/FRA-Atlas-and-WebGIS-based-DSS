"""
Test script for OpenRouter Gemini integration
Run this after setting up your OpenRouter API key in .env file
"""

import httpx
import json

# Test data - the sample claim form text
test_text = """
Annexure [

[See Rule 6(1)]

FORM - A

CLAIM FORM FOR RIGHTS TO FOREST LAND
[See Rule 11(1)(a)]

1. Name of the claimant (s): Karan Singh
2. Name of the spouse: Priya Singh

3. Name of father/mother: Baldev Singh
4. Address: Plot 56, Hilltop

5. Village: Devpur

6. Gram Panchayat: Devpur GP

7. Tehsil /Taluka: Shahdol
"""

async def test_process_text():
    """Test the /claims/process-text endpoint"""
    url = "http://127.0.0.1:8000/claims/process-text"
    
    payload = {
        "extracted_text": test_text
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=30.0)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Error: {e}")

async def test_create_claim_from_text():
    """Test the /claims/from-text endpoint"""
    url = "http://127.0.0.1:8000/claims/from-text"
    
    payload = {
        "extracted_text": test_text
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload, timeout=30.0)
            print(f"Status Code: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    import asyncio
    
    print("Testing OpenRouter Gemini integration...")
    print("=" * 50)
    
    print("\n1. Testing text processing...")
    asyncio.run(test_process_text())
    
    print("\n2. Testing claim creation from text...")
    asyncio.run(test_create_claim_from_text())