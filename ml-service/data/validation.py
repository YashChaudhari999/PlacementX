import pandas as pd
from loguru import logger

class DataValidator:
    
    @staticmethod
    def validate_success_data(df: pd.DataFrame) -> pd.DataFrame:
        """
        Validates historical student placement data.
        Ensures strict schema compliance and removes invalid records.
        """
        logger.info("Validating historical success data...")
        
        initial_count = len(df)
        
        # 1. Require Target Variable
        if 'placement_status' not in df.columns:
            raise ValueError("Target variable 'placement_status' is missing.")
            
        df = df.dropna(subset=['placement_status'])
        
        # 2. Schema types and null filling
        if 'cgpa' in df.columns:
            # Impute missing CGPA with median to avoid dropping too many rows
            median_cgpa = df['cgpa'].median()
            df['cgpa'] = df['cgpa'].fillna(median_cgpa)
            
            # Impossible values drop
            df = df[(df['cgpa'] >= 0.0) & (df['cgpa'] <= 10.0)]
            
        if 'active_backlogs' in df.columns:
            df['active_backlogs'] = df['active_backlogs'].fillna(0).astype(int)
            # Impossible values
            df = df[df['active_backlogs'] >= 0]
            
        # 3. Create Target Column (Placed = 1, otherwise 0)
        df['target'] = df['placement_status'].apply(lambda x: 1 if str(x).strip().lower() == 'placed' else 0)
        
        final_count = len(df)
        logger.info(f"Validation complete. Dropped {initial_count - final_count} invalid records. Total: {final_count}")
        
        return df

    @staticmethod
    def validate_forecast_data(df: pd.DataFrame) -> pd.DataFrame:
        """
        Validates aggregated historical forecasting data.
        """
        logger.info("Validating forecasting data...")
        initial_count = len(df)
        
        required_cols = ['year', 'placement_percentage', 'average_package', 'visiting_companies']
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required forecasting column: {col}")
                
        # Drop rows with null years
        df = df.dropna(subset=['year'])
        
        # Ensure year is int (e.g. "2024-2025" -> use the start year 2024 for chronological sorting)
        df['year_int'] = df['year'].astype(str).str.extract(r'(\d{4})')[0].astype(float)
        df = df.dropna(subset=['year_int'])
        df['year_int'] = df['year_int'].astype(int)
        
        df = df.sort_values('year_int')
        
        # Fill numeric nulls
        df['average_package'] = df['average_package'].fillna(0.0)
        df['visiting_companies'] = df['visiting_companies'].fillna(0).astype(int)
        
        final_count = len(df)
        logger.info(f"Forecast validation complete. Dropped {initial_count - final_count} invalid records. Total: {final_count}")
        
        return df
