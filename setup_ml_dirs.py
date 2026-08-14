import os

dirs = [
    "ml-service/app/api",
    "ml-service/app/services",
    "ml-service/app/models",
    "ml-service/app/preprocessing",
    "ml-service/app/schemas",
    "ml-service/app/database",
    "ml-service/datasets/raw",
    "ml-service/datasets/processed",
    "ml-service/training/success",
    "ml-service/training/forecasting",
    "ml-service/training/recommendation",
    "ml-service/training/resume",
    "ml-service/artifacts/models",
    "ml-service/artifacts/encoders",
    "ml-service/artifacts/metadata",
    "ml-service/reports",
    "ml-service/tests"
]

for d in dirs:
    os.makedirs(d, exist_ok=True)
    print(f"Created {d}")

with open("ml-service/requirements.txt", "w") as f:
    f.write("""fastapi
uvicorn
scikit-learn
xgboost
pandas
numpy
joblib
spacy
sentence-transformers
PyMuPDF
python-docx
psycopg2-binary
sqlalchemy
requests
""")

print("Created requirements.txt")
