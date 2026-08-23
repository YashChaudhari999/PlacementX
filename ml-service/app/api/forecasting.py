from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd

router = APIRouter()

class ForecastRequest(BaseModel):
    department: str
    year: str

@router.post("/forecast")
async def get_forecast(request: ForecastRequest):
    try:
        from app.main import MODELS
        models = MODELS.get("forecast")
        if not models:
            raise HTTPException(status_code=503, detail="Forecast models not loaded")
            
        target_year = int(request.year.split('/')[0])
        input_data = pd.DataFrame({'year': [target_year]})
        
        preds = {}
        for metric, model in models.items():
            preds[metric] = model.predict(input_data)[0]
            
        return {
            "projectedPlacementRate": float(preds.get('placement_percentage', 85.0)),
            "confidenceInterval": [
                float(preds.get('placement_percentage', 85.0)) - 3.5,
                float(preds.get('placement_percentage', 85.0)) + 3.5
            ],
            "projectedAveragePackage": float(preds.get('average_package', 5.0)),
            "projectedVisitingCompanies": int(preds.get('visiting_companies', 50)),
            "trend": "upward" if target_year > 2025 else "stable",
            "department": request.department,
            "targetYear": request.year,
            "modelVersion": "1.0.0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
