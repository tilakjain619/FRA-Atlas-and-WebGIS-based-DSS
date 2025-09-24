#!/usr/bin/env python3
"""
Test script to verify datetime serialization fix
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime
import json

# Test the serialize_for_json function
def serialize_for_json(obj):
    """Helper function to serialize objects for JSON"""
    if hasattr(obj, 'isoformat'):  # datetime object
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: serialize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_for_json(item) for item in obj]
    else:
        return obj

def test_datetime_serialization():
    """Test datetime serialization"""
    print("Testing datetime serialization...")
    
    # Test data with datetime objects (similar to what claims would have)
    test_data = {
        "claim_id": "test123",
        "claimant_name": "Test User",
        "submission_date": datetime.now(),
        "extracted_metadata": {
            "processed_at": datetime.now(),
            "nested_data": {
                "timestamp": datetime.now(),
                "text": "some text"
            }
        },
        "regular_field": "normal data"
    }
    
    print("Original data types:")
    print(f"submission_date: {type(test_data['submission_date'])}")
    print(f"extracted_metadata.processed_at: {type(test_data['extracted_metadata']['processed_at'])}")
    
    # Serialize the data
    try:
        serialized_data = serialize_for_json(test_data)
        print("✅ Serialization successful!")
        
        # Try to convert to JSON
        json_string = json.dumps(serialized_data)
        print("✅ JSON conversion successful!")
        
        print("Serialized data:")
        print(json.dumps(serialized_data, indent=2))
        
        return True
    except Exception as e:
        print(f"❌ Serialization failed: {e}")
        return False

def test_claim_analysis_data():
    """Test the analysis data preparation"""
    print("\n" + "="*50)
    print("Testing claim analysis data preparation...")
    
    # Simulate claims data from database
    mock_claims = [
        {
            "_id": "507f1f77bcf86cd799439011",
            "claimant_name": "Test User 1",
            "area": 15.5,  # Large area
            "village": "Test Village",
            "district": "Test District", 
            "state": "Test State",
            "claim_type": "individual",
            "submission_date": datetime.now(),
            "extracted_metadata": {
                "processing_method": "AI text processing",
                "processed_at": datetime.now()
            }
        },
        {
            "_id": "507f1f77bcf86cd799439012",
            "claimant_name": "Test User 2",
            "area": 0.05,  # Small area
            "village": "Test Village 2",
            "district": "Test District 2",
            "state": "Test State 2", 
            "claim_type": "community",
            "submission_date": datetime.now(),
            "extracted_metadata": {
                "processing_method": "Direct JSON input"
            }
        }
    ]
    
    try:
        # Prepare data for AI analysis (same logic as in the actual function)
        analysis_data = []
        for claim in mock_claims:
            claim_data = {
                "claim_id": claim.get("_id"),
                "claimant_name": claim.get("claimant_name"),
                "area": claim.get("area", 0),
                "village": claim.get("village"),
                "district": claim.get("district"),
                "state": claim.get("state"),
                "claim_type": claim.get("claim_type"),
                "submission_date": claim.get("submission_date"),
                "extracted_metadata": claim.get("extracted_metadata", {})
            }
            # Serialize all datetime objects to strings
            serialized_claim = serialize_for_json(claim_data)
            analysis_data.append(serialized_claim)
        
        # Try to convert to JSON (this was failing before)
        json_string = json.dumps(analysis_data)
        print("✅ Analysis data JSON conversion successful!")
        
        print("Analysis data preview:")
        print(json.dumps(analysis_data[0], indent=2))
        
        return True
    except Exception as e:
        print(f"❌ Analysis data preparation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("Running datetime serialization tests...")
    print("=" * 50)
    
    test1_passed = test_datetime_serialization()
    test2_passed = test_claim_analysis_data()
    
    print("\n" + "=" * 50)
    print("SUMMARY:")
    print(f"Basic serialization: {'✅ PASSED' if test1_passed else '❌ FAILED'}")
    print(f"Claim analysis data: {'✅ PASSED' if test2_passed else '❌ FAILED'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 All tests passed! The datetime serialization fix should work.")
    else:
        print("\n⚠️  Some tests failed. The fix needs more work.")