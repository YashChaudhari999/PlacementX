import logging
from typing import List

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self, model):
        self.model = model

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embeddings for a given text."""
        if not self.model:
            logger.error("Embedding model not loaded.")
            raise RuntimeError("Embedding model is not loaded.")
            
        try:
            # model.encode returns a numpy array
            embedding = self.model.encode(text)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
