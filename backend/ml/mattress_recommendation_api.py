"""
API Wrapper for Mattress Recommendation ML Model
Handles prediction and returns JSON
"""

import sys
import json
from mattress_recommendation import get_recommendation

if __name__ == '__main__':
    try:
        # Parse input from Node.js
        if len(sys.argv) > 1:
            user_data = json.loads(sys.argv[1])
        else:
            user_data = json.loads(sys.stdin.read())
        
        # Get recommendation
        result = get_recommendation(user_data)
        
        # Output as JSON
        print(json.dumps(result, indent=2))
        sys.exit(0)
    except Exception as e:
        error_response = {
            'error': str(e),
            'primary': None,
            'alternatives': []
        }
        print(json.dumps(error_response))
        sys.exit(1)
