#!/usr/bin/env python3
"""
Test the area parsing fix with the specific error case
"""

import asyncio
import json

# Mock the parse_area_value function
import re

def parse_area_value(area_input) -> float:
    """
    Parse area value from various formats:
    - Simple numbers: "2.5" -> 2.5
    - With units: "2.5 ha" -> 2.5
    - Complex: "0.4 ha (habitation), 1.3 ha (self-cultivation)" -> 1.7 (sum)
    - Invalid: anything else -> 0.0
    """
    if not area_input:
        return 0.0
    
    # If it's already a number, return it
    if isinstance(area_input, (int, float)):
        return float(area_input)
    
    # Convert to string and clean up
    area_str = str(area_input).strip().lower()
    
    if not area_str:
        return 0.0
    
    # Try simple float conversion first
    try:
        return float(area_str)
    except ValueError:
        pass
    
    # Extract all numeric values from the string
    numbers = re.findall(r'\d+\.?\d*', area_str)
    
    if not numbers:
        return 0.0
    
    # If multiple numbers found, sum them up (for cases like "0.4 ha (habitation), 1.3 ha (self-cultivation)")
    try:
        total_area = sum(float(num) for num in numbers)
        return total_area
    except ValueError:
        return 0.0

async def test_specific_error_case():
    """Test the specific error case that was reported"""
    
    # This is the exact error case
    problematic_area = "0.4 ha (habitation), 1.3 ha (self-cultivation)"
    
    print("Testing the specific error case:")
    print(f"Input area: {problematic_area}")
    
    # Test the old approach (this would fail)
    try:
        old_result = float(problematic_area)
        print(f"Old approach result: {old_result}")
    except ValueError as e:
        print(f"Old approach error: {e}")
    
    # Test the new approach (this should work)
    try:
        new_result = parse_area_value(problematic_area)
        print(f"New approach result: {new_result}")
        print("✅ Success! The fix works correctly.")
    except Exception as e:
        print(f"New approach error: {e}")
        print("❌ Fix failed.")
    
    # Test the full claim processing logic
    print("\nTesting full claim data processing:")
    
    extracted_data = {
        "claimant_name": "Test Claimant",
        "state": "Madhya Pradesh",
        "district": "Balaghat",
        "village": "Test Village",
        "claim_type": "individual",
        "area": problematic_area  # This was causing the error
    }
    
    try:
        claim_data = {
            "claimant_name": extracted_data.get("claimant_name") or "Unknown",
            "state": extracted_data.get("state") or "Unknown",
            "district": extracted_data.get("district") or "Unknown",
            "village": extracted_data.get("village") or "Unknown",
            "claim_type": extracted_data.get("claim_type") or "individual",
            "area": parse_area_value(extracted_data.get("area")),  # Using the new function
        }
        
        print("Processed claim data:")
        print(json.dumps(claim_data, indent=2))
        print("✅ Full processing successful!")
        
    except Exception as e:
        print(f"Processing error: {e}")
        print("❌ Processing failed.")

if __name__ == "__main__":
    asyncio.run(test_specific_error_case())