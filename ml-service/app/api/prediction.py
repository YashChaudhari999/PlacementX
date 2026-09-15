from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter()

class StudentData(BaseModel):
    cgpa: float
    experience_years: float = 0.0
    active_backlogs: int = 0
    education: str = ""
    occupation: str = ""
    skills: List[str] = []

import pandas as pd

@router.post("/success-prediction")
async def predict_success(data: StudentData):
    try:
        from app.main import MODELS
        model = MODELS.get("student_success")
        if not model:
            raise HTTPException(status_code=503, detail="Student success model not loaded")
            
        input_data = pd.DataFrame([{
            'cgpa': data.cgpa,
            'active_backlogs': data.active_backlogs,
            'skill_count': len(data.skills)
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
            
        meta = MODELS.get("student_success_meta", {})
        
        return {
            "predictedSuccessRate": float(prob * 100),
            "riskLevel": risk_level,
            "riskFactors": risk_factors,
            "modelVersion": meta.get("version", "unknown")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
