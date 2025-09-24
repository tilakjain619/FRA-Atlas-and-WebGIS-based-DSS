#!/usr/bin/env python3
"""
Test script to verify the backend API endpoints
"""
import asyncio
import httpx
import json

async def test_api_endpoints():
    """Test all API endpoints used by the Overview component"""
    base_url = "http://localhost:8000"
    
    endpoints = [
        "/claims/",
        "/claims/anomalies", 
        "/claims/statistics"
    ]
    
    async with httpx.AsyncClient() as client:
        for endpoint in endpoints:
            try:
                print(f"\n🔍 Testing {endpoint}...")
                response = await client.get(f"{base_url}{endpoint}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Success: {response.status_code}")
                    
                    if endpoint == "/claims/statistics":
                        stats = data.get('statistics', {})
                        print(f"   📊 Total Claims: {stats.get('total_claims', 0)}")
                        print(f"   🚨 Anomaly Claims: {stats.get('anomaly_claims', 0)}")
                        print(f"   📈 Today's Submissions: {stats.get('today_submissions', 0)}")
                        print(f"   📋 Individual Claims: {stats.get('individual_claims', 0)}")
                        print(f"   👥 Community Claims: {stats.get('community_claims', 0)}")
                    elif endpoint == "/claims/":
                        count = data.get('count', 0)
                        print(f"   📄 Claims Retrieved: {count}")
                    elif endpoint == "/claims/anomalies":
                        count = data.get('count', 0)
                        print(f"   ⚠️  Anomalous Claims: {count}")
                else:
                    print(f"❌ Error: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
            except Exception as e:
                print(f"❌ Connection Error: {str(e)}")

if __name__ == "__main__":
    print("🧪 Testing Backend API Endpoints for Overview Component")
    print("=" * 60)
    asyncio.run(test_api_endpoints())
    print("\n" + "=" * 60)
    print("✨ API Test Complete!")