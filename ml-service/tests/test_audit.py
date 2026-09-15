import os
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def audit():
    print("--- SUCCESS PREDICTION AUDIT ---")
    data_path = "datasets/raw/placement_data.csv"
    model_path = "artifacts/models/student_success_pipeline.joblib"
    
    if not os.path.exists(data_path) or not os.path.exists(model_path):
        print("Data or model missing.")
        return
        
    df = pd.read_csv(data_path)
    model = joblib.load(model_path)
    
    X = df.drop(columns=['placed'])
    y = df['placed']
    
    # 1. Baseline Comparison (Majority Class)
    majority_class = y.mode()[0]
    y_baseline = [majority_class] * len(y)
    
    baseline_acc = accuracy_score(y, y_baseline)
    
    # 2. Model Metrics
    y_pred = model.predict(X)
    y_prob = model.predict_proba(X)[:, 1]
    
    model_acc = accuracy_score(y, y_pred)
    model_f1 = f1_score(y, y_pred)
    model_auc = roc_auc_score(y, y_prob)
    
    print(f"Majority Baseline Accuracy: {baseline_acc:.4f}")
    print(f"Model Accuracy: {model_acc:.4f}")
    print(f"Model F1: {model_f1:.4f}")
    print(f"Model ROC-AUC: {model_auc:.4f}")
    
    # 3. Fairness / Bias check (By Education)
    print("\nFairness Check by 'education':")
    for edu in df['education'].unique():
        mask = X['education'] == edu
        if mask.sum() > 50:
            sub_y = y[mask]
            sub_pred = y_pred[mask]
            # Handle cases where true positive might not exist
            f1 = f1_score(sub_y, sub_pred) if len(np.unique(sub_y)) > 1 or (len(np.unique(sub_y))==1 and sub_y.iloc[0]==1) else 0
            print(f"  {edu} (n={mask.sum()}): Accuracy: {accuracy_score(sub_y, sub_pred):.4f}, F1: {f1:.4f}")

if __name__ == '__main__':
    audit()
