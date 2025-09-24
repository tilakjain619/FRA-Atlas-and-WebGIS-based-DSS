#!/usr/bin/env python3
"""
Test script for area parsing functionality
"""

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

# Test cases
test_cases = [
    "2.5",
    "2.5 ha",
    "0.4 ha (habitation), 1.3 ha (self-cultivation)",
    "1.2 hectares for cultivation",
    "No area specified",
    "",
    None,
    2.5,
    "3.0 ha (individual), 1.5 ha (community)",
    "Area: 2.8 ha"
]

print("Testing area parsing function:")
print("=" * 50)

for test_case in test_cases:
    result = parse_area_value(test_case)
    print(f"Input: {repr(test_case):40} -> Output: {result}")

print("=" * 50)
print("Test completed!")