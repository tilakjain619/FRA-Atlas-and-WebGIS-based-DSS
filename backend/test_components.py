#!/usr/bin/env python3
"""
Minimal test to identify the exact API error
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models.claim import Claim
from app.routes.claims import parse_area_value
import asyncio

def test_claim_model():
    """Test the Claim model directly"""
    print("Testing Claim model...")
    
    try:
        # Test basic claim creation
        claim_data = {
            "claimant_name": "Test User",
            "state": "Test State",
            "district": "Test District",
            "village": "Test Village",
            "claim_type": "individual",
            "area": 2.5,
            "is_anomaly": False
        }
        
        claim = Claim(**claim_data)
        print(f"✅ Claim model works: {claim}")
        print(f"Claim dict: {claim.dict()}")
        
        return True
    except Exception as e:
        print(f"❌ Claim model error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_area_parsing():
    """Test area parsing function"""
    print("\nTesting area parsing...")
    
    test_cases = [
        "2.5",
        "2.5 ha",
        "0.4 ha (habitation), 1.3 ha (self-cultivation)",
        None,
        "",
        "invalid"
    ]
    
    for test_case in test_cases:
        try:
            result = parse_area_value(test_case)
            print(f"✅ '{test_case}' -> {result}")
        except Exception as e:
            print(f"❌ '{test_case}' -> Error: {e}")

async def test_database_connection():
    """Test MongoDB connection"""
    print("\nTesting database connection...")
    
    try:
        from app.database import db
        
        # Try to ping the database
        await db.command("ping")
        print("✅ Database connection successful")
        
        # Try to insert a test document
        test_doc = {"test": "value"}
        result = await db["test_collection"].insert_one(test_doc)
        print(f"✅ Database insert successful: {result.inserted_id}")
        
        # Clean up
        await db["test_collection"].delete_one({"_id": result.inserted_id})
        print("✅ Database cleanup successful")
        
        return True
    except Exception as e:
        print(f"❌ Database error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("Running diagnostic tests...")
    print("=" * 50)
    
    # Test 1: Model validation
    model_ok = test_claim_model()
    
    # Test 2: Area parsing
    test_area_parsing()
    
    # Test 3: Database connection
    db_ok = await test_database_connection()
    
    print("\n" + "=" * 50)
    print("SUMMARY:")
    print(f"Model validation: {'✅ OK' if model_ok else '❌ FAILED'}")
    print(f"Database connection: {'✅ OK' if db_ok else '❌ FAILED'}")
    
    if model_ok and db_ok:
        print("\n🎉 All basic components are working!")
        print("The issue might be in the API request handling or environment setup.")
    else:
        print("\n⚠️  Found issues that need to be fixed first.")

if __name__ == "__main__":
    asyncio.run(main())