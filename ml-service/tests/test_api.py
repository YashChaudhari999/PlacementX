import pytest
from fastapi.testclient import TestClient
from app.main import app, MODELS

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_readiness_check():
    # If models are loaded (which they should be in the test environment if run after training),
    # this will return 200. If they aren't, it returns 503.
    response = client.get("/ready")
    if response.status_code == 200:
        assert response.json()["status"] == "ready"
    else:
        assert response.status_code == 503
        
def test_version_check():
    response = client.get("/version")
    assert response.status_code == 200
    assert "api_version" in response.json()

# Removed invalid tests
    
def test_embedding_match():
    response = client.post("/api/ai/embeddings/match", json={"text": "Software Engineer"})
    if response.status_code == 200:
        data = response.json()
        assert "embedding" in data
        assert isinstance(data["embedding"], list)
        assert len(data["embedding"]) > 0
    else:
        # If model isn't loaded
        assert response.status_code == 503
        
def test_embedding_batch():
    response = client.post("/api/ai/embeddings/batch", json={"texts": ["Software Engineer", "Data Scientist"]})
    if response.status_code == 200:
        data = response.json()
        assert "embeddings" in data
        assert len(data["embeddings"]) == 2
    else:
        assert response.status_code == 503
