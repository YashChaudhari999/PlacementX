import os
import pandas as pd
import numpy as np
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
import json

def generate_synthetic_forecasting_data():
    """Generates a synthetic time-series dataset for placement forecasting testing."""
    years = np.arange(2014, 2026)
    np.random.seed(42)
    
    # Simulate an upward trend with some noise
    base_placement = 60
    placement_percentages = base_placement + (years - 2014) * 2.5 + np.random.normal(0, 3, len(years))
    placement_percentages = np.clip(placement_percentages, 0, 100)
    
    base_package = 5.0
    average_packages = base_package + (years - 2014) * 0.4 + np.random.normal(0, 0.5, len(years))
    
    highest_packages = average_packages * 2.5 + np.random.normal(0, 2, len(years))
    
    base_companies = 50
    visiting_companies = base_companies + (years - 2014) * 5 + np.random.normal(0, 5, len(years))
    visiting_companies = np.round(visiting_companies).astype(int)
    
    df = pd.DataFrame({
        'year': years,
        'placement_percentage': placement_percentages,
        'average_package': average_packages,
        'highest_package': highest_packages,
        'visiting_companies': visiting_companies
    })
    
    raw_dir = "ml-service/datasets/raw"
    os.makedirs(raw_dir, exist_ok=True)
    df.to_csv(os.path.join(raw_dir, "historical_placement_synthetic.csv"), index=False)
    return df

def train_forecast_models():
    print("Starting Placement Forecasting Model Training...")
    
    df = generate_synthetic_forecasting_data()
    print("Generated synthetic historical placement data for development.")
    
    # Feature Engineering (Lag features)
    df['lag_1_placement'] = df['placement_percentage'].shift(1)
    df = df.dropna()
    
    # Chronological Split (Train on past, validate on most recent 2 years)
    train_df = df[df['year'] < 2024]
    test_df = df[df['year'] >= 2024]
    
    X_train = train_df[['year']]
    X_test = test_df[['year']]
    
    targets = ['placement_percentage', 'average_package', 'highest_package', 'visiting_companies']
    models = {}
    metrics = {}
    
    os.makedirs("ml-service/artifacts/models", exist_ok=True)
    
    for target in targets:
        y_train = train_df[target]
        y_test = test_df[target]
        
        # Simple Linear Regression works well for simple trends
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        
        models[target] = model
        metrics[target] = {"MAE": float(mae)}
        
        # Save model
        joblib.dump(model, f"ml-service/artifacts/models/{target}_model.joblib")
    
    print("Metrics on chronological test set:", metrics)
    
    metadata = {
        "model_name": "placement_forecast",
        "version": "1.0.0",
        "training_dataset": "synthetic_historical_development_data",
        "training_date": pd.Timestamp.now().strftime("%Y-%m-%d"),
        "metrics": metrics
    }
    
    os.makedirs("ml-service/artifacts/metadata", exist_ok=True)
    with open("ml-service/artifacts/metadata/forecast_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("Forecasting models saved.")

if __name__ == "__main__":
    train_forecast_models()
