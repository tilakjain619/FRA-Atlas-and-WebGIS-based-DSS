"""
Comprehensive Backend API Testing Script
Tests all available endpoints in the FRA DSS backend
"""

import httpx
import json
import asyncio
from typing import Dict, Any

class BackendAPITester:
    def __init__(self, base_url: str = "http://127.0.0.1:8000"):
        self.base_url = base_url
        self.test_results = []

    async def test_endpoint(self, method: str, endpoint: str, data: Dict[Any, Any] = None, description: str = ""):
        """Test a single endpoint and record the result"""
        url = f"{self.base_url}{endpoint}"
        
        print(f"\n{'='*60}")
        print(f"Testing: {method.upper()} {endpoint}")
        print(f"Description: {description}")
        print(f"URL: {url}")
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                if method.lower() == "get":
                    response = await client.get(url)
                elif method.lower() == "post":
                    response = await client.post(url, json=data)
                else:
                    print(f"❌ Unsupported method: {method}")
                    return
                
                print(f"Status Code: {response.status_code}")
                
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)}")
                    
                    # Record result
                    self.test_results.append({
                        "endpoint": endpoint,
                        "method": method,
                        "status_code": response.status_code,
                        "success": 200 <= response.status_code < 300,
                        "response": response_data
                    })
                    
                    if 200 <= response.status_code < 300:
                        print("✅ SUCCESS")
                    else:
                        print("❌ ERROR")
                        
                except json.JSONDecodeError:
                    print(f"Response Text: {response.text}")
                    print("❌ Invalid JSON response")
                    
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
            self.test_results.append({
                "endpoint": endpoint,
                "method": method,
                "status_code": 0,
                "success": False,
                "error": str(e)
            })

    async def run_all_tests(self):
        """Run all API endpoint tests"""
        
        print("🚀 Starting Backend API Tests...")
        print("="*60)
        
        # Test 1: Root endpoint
        await self.test_endpoint(
            "GET", 
            "/", 
            description="Root endpoint - server health check"
        )
        
        # Test 2: Get all claims
        await self.test_endpoint(
            "GET", 
            "/claims/", 
            description="Retrieve all claims from database"
        )
        
        # Test 3: Process text with AI
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
        
        await self.test_endpoint(
            "POST", 
            "/claims/process-text", 
            data={"extracted_text": test_text.strip()},
            description="Process claim form text using OpenRouter Gemini AI"
        )
        
        # Test 4: Create claim from text
        await self.test_endpoint(
            "POST", 
            "/claims/from-text", 
            data={"extracted_text": test_text.strip()},
            description="Process text and create claim record in database"
        )
        
        # Test 5: Create claim directly
        sample_claim = {
            "claimant_name": "Test User",
            "state": "Madhya Pradesh",
            "district": "Balaghat",
            "village": "Test Village",
            "claim_type": "individual",
            "area": 2.5
        }
        
        await self.test_endpoint(
            "POST", 
            "/claims/", 
            data=sample_claim,
            description="Create claim directly with structured data"
        )
        
        # Test 6: Check OpenAPI docs availability
        await self.test_endpoint(
            "GET", 
            "/docs", 
            description="FastAPI interactive documentation"
        )
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test results summary"""
        print(f"\n{'='*60}")
        print("📊 TEST RESULTS SUMMARY")
        print(f"{'='*60}")
        
        total_tests = len(self.test_results)
        successful_tests = sum(1 for result in self.test_results if result.get('success', False))
        failed_tests = total_tests - successful_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Successful: {successful_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        print(f"\n{'='*60}")
        print("📋 DETAILED RESULTS")
        print(f"{'='*60}")
        
        for i, result in enumerate(self.test_results, 1):
            status = "✅" if result.get('success', False) else "❌"
            print(f"{i}. {status} {result['method'].upper()} {result['endpoint']} - Status: {result.get('status_code', 'N/A')}")
            if 'error' in result:
                print(f"   Error: {result['error']}")

# Test configuration check
def check_configuration():
    """Check if the backend is properly configured"""
    print("🔧 CONFIGURATION CHECK")
    print("="*60)
    
    import os
    from dotenv import load_dotenv
    load_dotenv('backend/.env')
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    mongo_url = os.getenv("MONGO_DB_URL", "mongodb://localhost:27017")
    
    print(f"OpenRouter API Key: {'✅ Configured' if api_key else '❌ Not configured'}")
    print(f"MongoDB URL: {mongo_url}")
    
    if not api_key:
        print("\n⚠️  WARNING: OpenRouter API key not found!")
        print("   Please set OPENROUTER_API_KEY in backend/.env file")
        print("   AI text processing will not work without this.")
    
    print("")

async def main():
    """Main test runner"""
    check_configuration()
    
    tester = BackendAPITester()
    await tester.run_all_tests()
    
    print(f"\n{'='*60}")
    print("🎯 BACKEND API OVERVIEW")
    print(f"{'='*60}")
    print("Available Endpoints:")
    print("1. GET  /              - Server health check")
    print("2. GET  /claims/       - Get all claims")
    print("3. POST /claims/       - Create claim (structured data)")
    print("4. POST /claims/process-text - AI text processing")
    print("5. POST /claims/from-text    - AI process + create claim")
    print("6. GET  /docs          - Interactive API documentation")
    
    print(f"\n{'='*60}")
    print("💡 HOW TO USE")
    print(f"{'='*60}")
    print("1. Start backend: cd backend && python -m uvicorn app.main:app --reload")
    print("2. Visit docs: http://127.0.0.1:8000/docs")
    print("3. Test endpoints using this script or curl/Postman")
    print("4. Frontend can call these APIs for claim processing")

if __name__ == "__main__":
    asyncio.run(main())