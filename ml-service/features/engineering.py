import pandas as pd
import json
from loguru import logger

class FeatureEngineer:
    
    @staticmethod
    def extract_success_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Creates actionable machine learning features from raw PlacementX student records.
        """
        logger.info("Engineering features for Success Prediction...")
        
        # Parse Skills to a count feature
        def count_skills(skills_data):
            if pd.isna(skills_data): return 0
            if isinstance(skills_data, str):
                try:
                    # Might be stringified JSON
                    parsed = json.loads(skills_data)
                    if isinstance(parsed, list): return len(parsed)
                    if isinstance(parsed, dict): return len(parsed.keys())
                except:
                    # Might be comma separated
                    return len([s for s in skills_data.split(',') if s.strip()])
            if isinstance(skills_data, list):
                return len(skills_data)
            return 0
            
        df['skill_count'] = df['skills'].apply(count_skills)
        
        # Categorical Encoding for Placement Season (Optional, or just drop it if we don't want to overfit to season names)
        # We will keep cgpa, active_backlogs, and skill_count as numeric features.
        
        # Select Final Features
        features = ['cgpa', 'active_backlogs', 'skill_count']
        target = 'target'
        
        df_engineered = df[features + [target, 'placement_season']].copy()
        
        logger.info(f"Feature engineering complete. Selected features: {features}")
        return df_engineered

    @staticmethod
    def extract_forecast_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Creates time-series lag features for placement forecasting.
        """
        logger.info("Engineering features for Placement Forecasting...")
        
        # Sort chronologically
        df = df.sort_values('year_int')
        
        # Create Lag 1 feature for placement_percentage
        df['lag_1_placement_percentage'] = df['placement_percentage'].shift(1)
        
        # Create Lag 1 feature for average_package
        df['lag_1_average_package'] = df['average_package'].shift(1)
        
        # Drop the first row since it won't have a lag
        df = df.dropna(subset=['lag_1_placement_percentage'])
        
        features = ['year_int', 'lag_1_placement_percentage', 'lag_1_average_package']
        targets = ['placement_percentage', 'average_package', 'highest_package', 'visiting_companies']
        
        df_engineered = df[features + targets].copy()
        logger.info("Forecast feature engineering complete.")
        return df_engineered
