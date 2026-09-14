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
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Global variables for models
MODELS = {}

@app.on_event("startup")
async def load_models():
    logger.info("Loading ML models...")
    
    # Load Success Prediction Model
    from registry.model_registry import ModelRegistry
    registry = ModelRegistry()
    
    success_model, success_meta = registry.load_latest_model("student_success")
    if success_model:
        MODELS["student_success"] = success_model
        MODELS["student_success_meta"] = success_meta
        logger.info(f"Student success model loaded (version {success_meta['version']}).")
    else:
        logger.warning("Student success model not found in registry.")

    # Load Forecasting Models
    forecast_models = ['placement_percentage', 'average_package', 'highest_package', 'visiting_companies']
    MODELS["forecast"] = {}
    MODELS["forecast_meta"] = {}
    for fm in forecast_models:
        model, meta = registry.load_latest_model(f"forecast_{fm}")
        if model:
            MODELS["forecast"][fm] = model
            MODELS["forecast_meta"][fm] = meta
            logger.info(f"Forecast model {fm} loaded (version {meta['version']}).")
        else:
            logger.warning(f"Forecast model {fm} not found in registry.")
            
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

@app.get("/ready")
async def readiness_check():
    # Only ready if all critical models are loaded
    success_loaded = "student_success" in MODELS
    forecast_loaded = len(MODELS.get("forecast", {})) > 0
    embedding_loaded = "embedding" in MODELS
    
    if success_loaded and forecast_loaded and embedding_loaded:
        return {"status": "ready"}
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Service not ready: models are still loading or missing.")

@app.get("/version")
async def version_check():
    return {
        "service": "PlacementX ML Service",
        "api_version": "1.0.0",
        "models": {
            "success": MODELS.get("student_success_meta", {}).get("version", "unknown"),
            "forecast": MODELS.get("forecast_meta", {}).get("placement_percentage", {}).get("version", "unknown")
        }
    }
