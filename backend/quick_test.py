"""
Quick test for JSON input validation
"""
import requests
import json

def test_json_input():
    url = "http://127.0.0.1:8000/claims/from-text"
    
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
            "state": None,
            "claim_type": "individual",
            "area": None
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: JSON input accepted!")
        else:
            print("❌ ERROR: JSON input rejected")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    print("🧪 Testing JSON Input Format")
    print("="*40)
    test_json_input()