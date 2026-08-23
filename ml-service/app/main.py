from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os
import logging
from .api import prediction, forecasting, resume, embeddings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PlacementX ML Service",
    description="Machine Learning service for PlacementX platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
MODELS = {}

@app.on_event("startup")
async def load_models():
    logger.info("Loading ML models...")
    
    # Load Success Prediction Model
    success_model_path = os.path.join("artifacts", "models", "student_success_pipeline.joblib")
    if os.path.exists(success_model_path):
        MODELS["student_success"] = joblib.load(success_model_path)
        logger.info("Student success model loaded.")
    else:
        logger.warning(f"Student success model not found at {success_model_path}. Please train the model.")

    # Load Forecasting Models
    forecast_models = ['placement_percentage', 'average_package', 'highest_package', 'visiting_companies']
    MODELS["forecast"] = {}
    for fm in forecast_models:
        fm_path = os.path.join("artifacts", "models", f"{fm}_model.joblib")
        if os.path.exists(fm_path):
            MODELS["forecast"][fm] = joblib.load(fm_path)
        else:
            logger.warning(f"Forecast model {fm} not found.")
            
    # Load SentenceTransformer for embeddings
    try:
        from sentence_transformers import SentenceTransformer
        MODELS["embedding"] = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("SentenceTransformer model loaded.")
    except Exception as e:
        logger.error(f"Failed to load SentenceTransformer: {e}")

app.include_router(prediction.router, prefix="/api/ai/students", tags=["Prediction"])
app.include_router(forecasting.router, prefix="/api/ai/analytics", tags=["Forecasting"])
app.include_router(resume.router, prefix="/api/ai/resume", tags=["Resume"])
app.include_router(embeddings.router, prefix="/api/ai/embeddings", tags=["Embeddings"])

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "models_loaded": {
            "success": "student_success" in MODELS,
            "forecast": len(MODELS.get("forecast", {})) > 0,
            "embedding": "embedding" in MODELS
        }
    }
