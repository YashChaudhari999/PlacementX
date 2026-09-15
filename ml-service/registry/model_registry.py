import os
import json
import joblib
from datetime import datetime
from loguru import logger
import hashlib

class ModelRegistry:
    def __init__(self):
        self.base_dir = os.getenv("MODEL_REGISTRY_PATH", "artifacts/registry")
        os.makedirs(self.base_dir, exist_ok=True)
        
    def save_model(self, model, name: str, version: str, metrics: dict, params: dict):
        """
        Saves a model to the registry with metadata.
        Directory structure: artifacts/registry/<name>/<version>/
        """
        model_dir = os.path.join(self.base_dir, name, version)
        os.makedirs(model_dir, exist_ok=True)
        
        # Save model joblib
        model_path = os.path.join(model_dir, "model.joblib")
        joblib.dump(model, model_path)
        
        # Calculate checksum
        with open(model_path, "rb") as f:
            checksum = hashlib.sha256(f.read()).hexdigest()
        
        # Metadata
        metadata = {
            "model_name": name,
            "version": version,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "metrics": metrics,
            "hyperparameters": params,
            "checksum": checksum,
            "status": "APPROVED", # In a real system, this would be STAGING until human approval
            "environment": os.getenv("MODEL_ENVIRONMENT", "production")
        }
        
        meta_path = os.path.join(model_dir, "metadata.json")
        with open(meta_path, "w") as f:
            json.dump(metadata, f, indent=4)
            
        # Update latest pointer
        latest_path = os.path.join(self.base_dir, name, "latest.json")
        with open(latest_path, "w") as f:
            json.dump({"latest_version": version}, f, indent=4)
            
        logger.info(f"Successfully registered model {name} v{version} to {model_dir}")
        
    def load_latest_model(self, name: str):
        """
        Loads the latest version of the model based on latest.json.
        """
        latest_path = os.path.join(self.base_dir, name, "latest.json")
        if not os.path.exists(latest_path):
            logger.warning(f"No registered model found for {name}")
            return None, None
            
        with open(latest_path, "r") as f:
            latest_version = json.load(f).get("latest_version")
            
        model_path = os.path.join(self.base_dir, name, latest_version, "model.joblib")
        meta_path = os.path.join(self.base_dir, name, latest_version, "metadata.json")
        
        if os.path.exists(model_path):
            model = joblib.load(model_path)
            with open(meta_path, "r") as f:
                meta = json.load(f)
            return model, meta
        
        return None, None
