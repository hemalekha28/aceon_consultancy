"""
Mattress Recommendation ML Model
Uses Decision Tree algorithm for mattress recommendations
"""

import json
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder
import pickle
import os

class MattressRecommender:
    def __init__(self):
        self.model = None
        self.label_encoders = {}
        self.feature_names = ['weight', 'sleeping_position', 'firmness_preference', 'back_pain']
        self.mattress_profiles = {
            'Orthopedic Memory Foam': {
                'ideal_weight': ['light', 'avg-light', 'avg-heavy'],
                'ideal_position': ['side', 'back'],
                'ideal_firmness': ['medium-soft', 'medium'],
                'back_pain_benefit': True,
                'reasons': [
                    'Excellent spinal alignment support',
                    'Memory foam contours to your body',
                    'Reduces pressure points',
                    'Perfect for pain relief'
                ]
            },
            'Firm Hybrid Support': {
                'ideal_weight': ['avg-heavy', 'heavy'],
                'ideal_position': ['back', 'stomach'],
                'ideal_firmness': ['firm', 'extra-firm'],
                'back_pain_benefit': True,
                'reasons': [
                    'Maximum support for heavy weight',
                    'Proper spinal alignment',
                    'Reduced motion transfer',
                    'Enhanced edge support'
                ]
            },
            'Soft Gel Cooling': {
                'ideal_weight': ['light', 'avg-light'],
                'ideal_position': ['side'],
                'ideal_firmness': ['soft', 'medium-soft'],
                'back_pain_benefit': False,
                'reasons': [
                    'Exceptional pressure relief',
                    'Gel cooling technology prevents overheating',
                    'Ideal for side sleepers',
                    'Comfortable contouring'
                ]
            },
            'Latex Natural Support': {
                'ideal_weight': ['light', 'avg-light', 'avg-heavy'],
                'ideal_position': ['back', 'side'],
                'ideal_firmness': ['medium', 'medium-firm'],
                'back_pain_benefit': False,
                'reasons': [
                    'Natural latex provides balanced support',
                    'Excellent bounce and responsiveness',
                    'Hypoallergenic properties',
                    'Durable and long-lasting'
                ]
            },
            'Spring Comfort Classic': {
                'ideal_weight': ['heavy'],
                'ideal_position': ['back', 'stomach'],
                'ideal_firmness': ['firm'],
                'back_pain_benefit': False,
                'reasons': [
                    'Excellent airflow and temperature regulation',
                    'Strong support for heavier persons',
                    'Classic coil system durability',
                    'Good edge support'
                ]
            }
        }
        self.train_model()

    def train_model(self):
        """Train the decision tree model with synthetic data"""
        # Training data: [weight, position, firmness, back_pain] -> mattress_type
        X_train = [
            # Light weight, side sleeping, soft preference
            ['light', 'side', 'soft', 1],
            ['light', 'side', 'medium-soft', 1],
            ['light', 'side', 'soft', 0],
            ['light', 'side', 'medium-soft', 0],
            
            # Light weight, back sleeping
            ['light', 'back', 'medium', 0],
            ['light', 'back', 'medium-soft', 0],
            
            # Average light, side sleeping
            ['avg-light', 'side', 'medium-soft', 1],
            ['avg-light', 'side', 'medium', 1],
            ['avg-light', 'side', 'soft', 0],
            
            # Average light, back sleeping
            ['avg-light', 'back', 'medium', 0],
            ['avg-light', 'back', 'medium-firm', 0],
            
            # Average heavy, back sleeping, back pain
            ['avg-heavy', 'back', 'medium-firm', 1],
            ['avg-heavy', 'back', 'firm', 1],
            ['avg-heavy', 'back', 'firm', 0],
            
            # Average heavy, stomach
            ['avg-heavy', 'stomach', 'firm', 0],
            ['avg-heavy', 'stomach', 'firm', 1],
            
            # Heavy, back/stomach, firm
            ['heavy', 'back', 'firm', 1],
            ['heavy', 'stomach', 'firm', 1],
            ['heavy', 'back', 'extra-firm', 0],
            ['heavy', 'stomach', 'extra-firm', 0],
        ]
        
        # Target: mattress types (encoded)
        y_train = [0, 0, 0, 0, 3, 3, 4, 4, 4, 3, 3, 1, 1, 1, 2, 2, 1, 1, 2, 2]
        
        # Create label encoders
        for i, feature in enumerate(self.feature_names):
            le = LabelEncoder()
            feature_values = [row[i] for row in X_train]
            le.fit(feature_values)
            self.label_encoders[feature] = le
        
        # Encode training data
        X_encoded = []
        for row in X_train:
            encoded_row = []
            for i, feature in enumerate(self.feature_names):
                encoded_row.append(self.label_encoders[feature].transform([row[i]])[0])
            X_encoded.append(encoded_row)
        
        # Train decision tree
        self.model = DecisionTreeClassifier(max_depth=4, random_state=42)
        self.model.fit(X_encoded, y_train)

    def predict(self, user_profile):
        """Predict mattress recommendation and confidence"""
        try:
            weight = user_profile.get('weight', 'avg-light')
            position = user_profile.get('position', 'back')
            firmness = user_profile.get('firmness', 'medium')
            back_pain = user_profile.get('backPain', 'no')
            
            # Convert back_pain to binary
            back_pain_binary = 1 if back_pain in ['frequently', 'occasionally'] else 0
            
            # Encode the input
            X_input = [[
                self.label_encoders['weight'].transform([weight])[0],
                self.label_encoders['sleeping_position'].transform([position])[0],
                self.label_encoders['firmness_preference'].transform([firmness])[0],
                back_pain_binary
            ]]
            
            # Get prediction
            prediction = self.model.predict(X_input)[0]
            probabilities = self.model.predict_proba(X_input)[0]
            
            # Map prediction to mattress type
            mattress_types = list(self.mattress_profiles.keys())
            recommended_mattress = mattress_types[prediction]
            confidence = float(max(probabilities) * 100)
            
            return {
                'mattress': recommended_mattress,
                'confidence': min(98, max(75, confidence)),  # Keep between 75-98%
                'reasons': self.mattress_profiles[recommended_mattress]['reasons']
            }
        except Exception as e:
            return {
                'error': str(e),
                'mattress': None,
                'confidence': 0
            }

    def get_alternatives(self, user_profile, exclude_mattress):
        """Get alternative mattress recommendations"""
        mattress_list = list(self.mattress_profiles.keys())
        mattress_list.remove(exclude_mattress)
        
        back_pain = user_profile.get('backPain', 'no') in ['frequently', 'occasionally']
        
        # Score alternatives based on user profile
        alternatives = []
        for mattress in mattress_list:
            profile = self.mattress_profiles[mattress]
            score = 0
            
            # Weight matching
            if user_profile.get('weight') in profile['ideal_weight']:
                score += 25
            
            # Position matching
            if user_profile.get('position') in profile['ideal_position']:
                score += 25
            
            # Firmness matching
            if user_profile.get('firmness') in profile['ideal_firmness']:
                score += 25
            
            # Back pain benefit
            if back_pain and profile['back_pain_benefit']:
                score += 15
            if not back_pain and not profile['back_pain_benefit']:
                score += 10
            
            confidence = min(98, max(70, 70 + (score / 90) * 28))
            
            alternatives.append({
                'mattress': mattress,
                'confidence': confidence,
                'reasons': profile['reasons'][:3]  # Top 3 reasons
            })
        
        # Return top 3 alternatives sorted by confidence
        return sorted(alternatives, key=lambda x: x['confidence'], reverse=True)[:3]


# Initialize the model
recommender = MattressRecommender()

def get_recommendation(user_data):
    """Main function to get mattress recommendation"""
    primary = recommender.predict(user_data)
    
    if primary.get('error'):
        return primary
    
    alternatives = recommender.get_alternatives(user_data, primary['mattress'])
    
    return {
        'primary': primary,
        'alternatives': alternatives,
        'user_profile': {
            'weight': user_data.get('weight'),
            'position': user_data.get('position'),
            'firmness': user_data.get('firmness'),
            'backPain': user_data.get('backPain')
        }
    }
