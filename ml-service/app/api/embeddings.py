from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sys

# Hack to import MODELS from main (in a real app you'd use Dependency Injection)
from app.main import MODELS
from app.services.embedding_service import EmbeddingService

router = APIRouter()

class TextPayload(BaseModel):
    text: str

@router.post("/match")
async def generate_embedding(payload: TextPayload):
    try:
        model = MODELS.get("embedding")
        if not model:
            raise HTTPException(status_code=503, detail="Embedding model not loaded")
            
        service = EmbeddingService(model)
        embedding = service.generate_embedding(payload.text)
        
        return {
            "embedding": embedding
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
