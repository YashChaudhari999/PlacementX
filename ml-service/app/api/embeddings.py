from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import sys

from app.services.embedding_service import EmbeddingService

router = APIRouter()

class TextPayload(BaseModel):
    text: str

class BatchTextPayload(BaseModel):
    texts: List[str]

@router.post("/match")
async def generate_embedding(payload: TextPayload):
    try:
        from app.main import MODELS
        model = MODELS.get("embedding")
        if not model:
            raise HTTPException(status_code=503, detail="Embedding model not loaded")
            
        service = EmbeddingService(model)
        embedding = service.generate_embedding(payload.text)
        
        return {
            "embedding": embedding
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch")
async def generate_batch_embeddings(payload: BatchTextPayload):
    try:
        from app.main import MODELS
        model = MODELS.get("embedding")
        if not model:
            raise HTTPException(status_code=503, detail="Embedding model not loaded")
            
        service = EmbeddingService(model)
        embeddings = [service.generate_embedding(t) for t in payload.texts]
        
        return {
            "embeddings": embeddings
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

