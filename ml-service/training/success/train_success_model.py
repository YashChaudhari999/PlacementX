import os
import pandas as pd
import json
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

def train_success_model():
    print("Starting Success Prediction Model Training...")
    
    data_path = "ml-service/datasets/raw/placement_data.csv"
    if not os.path.exists(data_path):
        print(f"Data not found at {data_path}. Please run download_datasets.py first.")
        return
        
    df = pd.read_csv(data_path)
    
    # Target and Features
    X = df.drop(columns=['placed'])
    y = df['placed']
    
    # Define features
    numeric_features = ['cgpa', 'experience_years', 'active_backlogs']
    categorical_features = ['education', 'occupation']
    
    # Preprocessing
    numeric_transformer = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])
    
    categorical_transformer = Pipeline(steps=[
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    # Complete Pipeline
    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(random_state=42, class_weight='balanced'))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)
    
    # Hyperparameter tuning
    param_grid = {
        'classifier__n_estimators': [50, 100],
        'classifier__max_depth': [5, 10, None]
    }
    
    print("Tuning hyperparameters...")
    grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring='f1')
    grid_search.fit(X_train, y_train)
    
    best_model = grid_search.best_estimator_
    
    # Evaluation
    y_pred = best_model.predict(X_test)
    y_prob = best_model.predict_proba(X_test)[:, 1]
    
    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_test, y_prob))
    }
    
    print("Metrics on test set:", metrics)
    
    # Save Model Artifacts
    os.makedirs("ml-service/artifacts/models", exist_ok=True)
    os.makedirs("ml-service/artifacts/metadata", exist_ok=True)
    os.makedirs("ml-service/reports", exist_ok=True)
    
    model_path = "ml-service/artifacts/models/student_success_pipeline.joblib"
    joblib.dump(best_model, model_path)
    
    metadata = {
        "model_name": "student_success",
        "version": "1.0.0",
        "training_dataset": "openml_adult_proxy",
        "training_date": pd.Timestamp.now().strftime("%Y-%m-%d"),
        "features": numeric_features + categorical_features,
        "metrics": metrics
    }
    
    with open("ml-service/artifacts/metadata/model_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    with open("ml-service/reports/student_success_report.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_success_model()
