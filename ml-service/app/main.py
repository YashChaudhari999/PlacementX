from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import joblib
import json
import pandas as pd
import numpy as np
import os
import spacy
from sentence_transformers import SentenceTransformer

app = FastAPI(title="PlacementX ML Service")

# Global models
models = {}

@app.on_event("startup")
async def load_models():
    print("Loading models...")
    try:
        models['success_model'] = joblib.load("artifacts/models/student_success_pipeline.joblib")
        models['forecast_placement'] = joblib.load("artifacts/models/placement_percentage_model.joblib")
        models['forecast_avg_pkg'] = joblib.load("artifacts/models/average_package_model.joblib")
        models['forecast_high_pkg'] = joblib.load("artifacts/models/highest_package_model.joblib")
        models['forecast_companies'] = joblib.load("artifacts/models/visiting_companies_model.joblib")
        
        with open("artifacts/metadata/model_metadata.json", "r") as f:
            models['success_metadata'] = json.load(f)
            
        with open("artifacts/metadata/forecast_metadata.json", "r") as f:
            models['forecast_metadata'] = json.load(f)
            
    except Exception as e:
        print(f"Warning: Not all models loaded. {e}")
        
    try:
        # Load embedding model on CPU
        models['embedder'] = SentenceTransformer('all-MiniLM-L6-v2')
    except Exception as e:
        print(f"Warning: Could not load sentence transformer. {e}")
        
    print("Models loaded successfully.")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/model-info")
def model_info():
    return {
        "success_model_version": models.get('success_metadata', {}).get('version', 'unknown'),
        "forecast_model_version": models.get('forecast_metadata', {}).get('version', 'unknown'),
        "models_loaded": list(models.keys())
    }

class StudentData(BaseModel):
    studentId: str
    cgpa: float
    experience_years: float
    active_backlogs: int
    education: str
    occupation: str

@app.post("/api/ai/students/{studentId}/success-prediction")
def predict_success(studentId: str, data: StudentData):
    if 'success_model' not in models:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    # Prepare input for pipeline
    df_input = pd.DataFrame([data.dict()])
    df_input = df_input.drop(columns=['studentId'])
    
    try:
        # Predict
        prob = models['success_model'].predict_proba(df_input)[0][1]
        
        # Simple risk logic
        risk_level = "LOW"
        if prob < 0.4:
            risk_level = "HIGH"
        elif prob < 0.7:
            risk_level = "MEDIUM"
            
        # Mock SHAP/factors for now as extracting from pipeline can be complex
        factors = []
        if data.active_backlogs > 0:
            factors.append({"feature": "Active Backlogs", "impact": "negative"})
        if data.cgpa > 8.0:
            factors.append({"feature": "High CGPA", "impact": "positive"})
        elif data.cgpa < 6.0:
            factors.append({"feature": "Low CGPA", "impact": "negative"})
            
        return {
            "studentId": studentId,
            "predictedSuccessRate": float(prob * 100),
            "riskLevel": risk_level,
            "modelVersion": models['success_metadata']['version'],
            "topFactors": factors
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/ai/analytics/forecast")
def forecast(forecastYear: int = 2026):
    if 'forecast_placement' not in models:
        raise HTTPException(status_code=503, detail="Forecast models not loaded")
        
    try:
        X = pd.DataFrame([{"year": forecastYear}])
        placement = models['forecast_placement'].predict(X)[0]
        avg_pkg = models['forecast_avg_pkg'].predict(X)[0]
        high_pkg = models['forecast_high_pkg'].predict(X)[0]
        companies = models['forecast_companies'].predict(X)[0]
        
        return {
            "forecastYear": forecastYear,
            "placementPercentage": float(np.clip(placement, 0, 100)),
            "averagePackage": float(max(0, avg_pkg)),
            "highestPackage": float(max(0, high_pkg)),
            "visitingCompanies": int(max(0, companies)),
            "trend": "UPWARD" if placement > 60 else "STABLE",
            "modelVersion": models['forecast_metadata']['version']
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class ProfileData(BaseModel):
    text: str

@app.post("/api/ai/embeddings")
def generate_embedding(data: ProfileData):
    if 'embedder' not in models:
        raise HTTPException(status_code=503, detail="Embedder not loaded")
    
    emb = models['embedder'].encode(data.text)
    return {"embedding": emb.tolist()}

@app.post("/api/ai/resume/parse")
async def parse_resume(file: UploadFile = File(...)):
    # Mock parser for PDF
    # Real implementation would use PyMuPDF (fitz)
    content = await file.read()
    
    # Simple dummy extraction
    return {
        "filename": file.filename,
        "parsedData": {
            "skills": ["React", "Python"],
            "education": "B.Tech",
            "experience": "Internship"
        }
    }
