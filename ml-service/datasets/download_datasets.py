import os
import pandas as pd
from sklearn.datasets import fetch_openml

def download_openml_dataset():
    print("Fetching OpenML dataset for proxy placement success (using Adult dataset)...")
    # Adult dataset is a real public dataset used for classification
    adult = fetch_openml(name='adult', version=2, as_frame=True)
    df = adult.frame
    
    # Map proxy features to student success features
    # education-num -> cgpa proxy
    # age -> proxy for experience/age
    # class -> >50K = placed (1), <=50K = not placed (0)
    
    df['placed'] = df['class'].apply(lambda x: 1 if '>50K' in str(x) else 0)
    df['cgpa'] = df['education-num'] * 0.6  # Scale 1-16 to ~0-10
    df['experience_years'] = df['age'] - 18
    df['active_backlogs'] = 0 # Dummy for now
    
    # Save a subset to simulate placement data
    df_subset = df[['cgpa', 'experience_years', 'active_backlogs', 'placed', 'education', 'occupation']].dropna().sample(2000, random_state=42)
    
    raw_dir = "ml-service/datasets/raw"
    os.makedirs(raw_dir, exist_ok=True)
    df_subset.to_csv(os.path.join(raw_dir, "placement_data.csv"), index=False)
    print("Saved proxy placement data.")

if __name__ == "__main__":
    download_openml_dataset()
