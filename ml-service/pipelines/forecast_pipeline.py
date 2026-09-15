import os
from datetime import datetime
from loguru import logger
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error
import pandas as pd
import numpy as np

from data.ingestion import DataIngestion
from data.validation import DataValidator
from features.engineering import FeatureEngineer
from registry.model_registry import ModelRegistry

def run_forecast_pipeline():
    logger.info("Starting Placement Forecasting Training Pipeline")
    
    # 1. Ingestion
    ingestor = DataIngestion()
    df_raw = ingestor.fetch_historical_forecasting_data()
    if df_raw.empty or len(df_raw) < 2:
        logger.warning("Not enough historical placement seasons for forecasting. Aborting.")
        return
        
    # 2. Validation
    df_valid = DataValidator.validate_forecast_data(df_raw)
    
    # 3. Feature Engineering
    # We will just use year_int for trend prediction due to limited historical data
    # (Removed lag features)
    df_valid['year_int'] = df_valid['year'].str.extract(r'(\d{4})')[0].astype(int)
    
    # 4. Temporal Split (Last row is test)
    train_df = df_valid.iloc[:-1]
    test_df = df_valid.iloc[-1:]
    
    features = ['year_int']
    targets = ['placement_percentage', 'average_package', 'highest_package', 'visiting_companies']
    
    registry = ModelRegistry()
    version = f"forecast-{datetime.utcnow().strftime('%Y.%m.%d.%H%M')}"
    
    for target in targets:
        logger.info(f"Training model for {target}...")
        
        X_train = train_df[features]
        y_train = train_df[target]
        X_test = test_df[features]
        y_test = test_df[target]
        
        # 5. Training
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        # 6. Evaluation
        preds = model.predict(X_test)
        mae = mean_absolute_error(y_test, preds)
        
        metrics = {"MAE": float(mae)}
        logger.info(f"Metrics for {target}: {metrics}")
        
        # 7. Registry
        registry.save_model(
            model=model,
            name=f"forecast_{target}",
            version=version,
            metrics=metrics,
            params={"model": "LinearRegression"}
        )
    
if __name__ == "__main__":
    run_forecast_pipeline()
