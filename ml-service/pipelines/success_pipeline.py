import os
from datetime import datetime
from loguru import logger
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, average_precision_score, f1_score, accuracy_score
import pandas as pd
import numpy as np

from data.ingestion import DataIngestion
from data.validation import DataValidator
from features.engineering import FeatureEngineer
from registry.model_registry import ModelRegistry

def run_success_pipeline():
    logger.info("Starting Success Prediction Training Pipeline")
    
    # 1. Ingestion
    ingestor = DataIngestion()
    df_raw = ingestor.fetch_historical_success_data()
    if df_raw.empty or len(df_raw) < 10:
        logger.warning("Not enough real production data. Pipeline requires historical data. Aborting training.")
        return
        
    # 2. Validation
    df_valid = DataValidator.validate_success_data(df_raw)
    
    # 3. Feature Engineering
    df_features = FeatureEngineer.extract_success_features(df_valid)
    
    # 4. Temporal Split
    # We sort by placement_season and split. Last 20% is test.
    df_features = df_features.sort_values('placement_season')
    
    split_idx = int(len(df_features) * 0.8)
    train_df = df_features.iloc[:split_idx]
    test_df = df_features.iloc[split_idx:]
    
    features = ['cgpa', 'active_backlogs', 'skill_count']
    X_train = train_df[features]
    y_train = train_df['target']
    X_test = test_df[features]
    y_test = test_df['target']
    
    # 5. Training
    logger.info("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced')
    model.fit(X_train, y_train)
    
    # 6. Evaluation
    probs = model.predict_proba(X_test)[:, 1]
    preds = model.predict(X_test)
    
    roc_auc = roc_auc_score(y_test, probs) if len(np.unique(y_test)) > 1 else 0.5
    pr_auc = average_precision_score(y_test, probs) if len(np.unique(y_test)) > 1 else 0.5
    f1 = f1_score(y_test, preds)
    acc = accuracy_score(y_test, preds)
    
    metrics = {
        "ROC-AUC": float(roc_auc),
        "PR-AUC": float(pr_auc),
        "F1": float(f1),
        "Accuracy": float(acc)
    }
    logger.info(f"Evaluation Metrics: {metrics}")
    
    # 7. Registry
    registry = ModelRegistry()
    version = f"success-{datetime.utcnow().strftime('%Y.%m.%d.%H%M')}"
    registry.save_model(
        model=model,
        name="student_success",
        version=version,
        metrics=metrics,
        params={"n_estimators": 100, "max_depth": 10, "class_weight": "balanced"}
    )
    
if __name__ == "__main__":
    run_success_pipeline()
