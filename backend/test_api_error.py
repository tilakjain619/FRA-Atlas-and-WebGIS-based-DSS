#!/usr/bin/env python3
"""
Test script to reproduce the frontend API error
"""

import asyncio
import httpx
import json

API_BASE_URL = "http://localhost:8000"

async def test_claims_api():
    """Test the claims API with sample data"""
    
    # Test data similar to what frontend would send
    test_data = {
        "extracted_text": "1. Name of the claimant (s): Test User\n2. Village: Test Village\n3. District: Test District\n4. State: Test State\n5. Area: 2.5 ha"
    }
    
    print("Testing Claims API...")
    print(f"API URL: {API_BASE_URL}/claims/")
    print(f"Test data: {json.dumps(test_data, indent=2)}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            print("\nSending POST request...")
            response = await client.post(
                f"{API_BASE_URL}/claims/",
                json=test_data
            )
            
            print(f"Status Code: {response.status_code}")
            print(f"Response Headers: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Success!")
                print(f"Response: {json.dumps(result, indent=2)}")
            else:
                print("❌ Error!")
                print(f"Error Response: {response.text}")
                
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

    # Also test a simple health check
    print("\n" + "="*50)
    print("Testing health check...")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{API_BASE_URL}/")
            print(f"Health check status: {response.status_code}")
            if response.status_code == 200:
                print(f"Health check response: {response.json()}")
            else:
                print(f"Health check error: {response.text}")
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_claims_api())