from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter()

class StudentData(BaseModel):
    cgpa: float
    experience_years: float
    active_backlogs: int
    education: str
    occupation: str

import pandas as pd
from app.main import MODELS

@router.post("/success-prediction")
async def predict_success(data: StudentData):
    try:
        model = MODELS.get("student_success")
        if not model:
            raise HTTPException(status_code=503, detail="Student success model not loaded")
            
        input_data = pd.DataFrame([{
            'cgpa': data.cgpa,
            'experience_years': data.experience_years,
            'active_backlogs': data.active_backlogs,
            'education': data.education,
            'occupation': data.occupation
        }])
        
        prob = model.predict_proba(input_data)[0][1]
        
        risk_level = "LOW"
        if prob < 0.40:
            risk_level = "HIGH"
        elif prob < 0.70:
            risk_level = "MEDIUM"
            
        risk_factors = []
        if data.active_backlogs > 0:
            risk_factors.append({"feature": "Active Backlogs", "impact": "negative"})
        if data.cgpa < 7.0:
            risk_factors.append({"feature": "Low CGPA", "impact": "negative"})
        elif data.cgpa >= 8.5:
            risk_factors.append({"feature": "High CGPA", "impact": "positive"})
            
        return {
            "predictedSuccessRate": float(prob * 100),
            "riskLevel": risk_level,
            "riskFactors": risk_factors,
            "modelVersion": "1.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
