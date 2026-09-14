import os
import pandas as pd
from sqlalchemy import create_engine
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

class DataIngestion:
    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL")
        if not self.db_url:
            raise ValueError("DATABASE_URL environment variable is missing.")
        
        # Ensure we use psycopg2 instead of asyncpg for pandas
        if self.db_url.startswith("postgres://"):
            self.db_url = self.db_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif self.db_url.startswith("postgresql://"):
            self.db_url = self.db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            
        if "?pgbouncer=true" in self.db_url:
            self.db_url = self.db_url.replace("?pgbouncer=true", "")
            
        self.engine = create_engine(self.db_url)
        
    def fetch_historical_success_data(self) -> pd.DataFrame:
        """
        Fetches real historical placement data from the ImportedStudent table.
        This replaces the synthetic Adult Census Income dataset.
        """
        logger.info("Fetching historical success data from PostgreSQL...")
        
        query = """
            SELECT 
                "cgpa", 
                "active_backlogs" as active_backlogs, 
                "skills", 
                "placement_season" as placement_season,
                "placement_status" as placement_status
            FROM "students"
            WHERE "placement_status" IS NOT NULL
        """
        
        try:
            df = pd.read_sql(query, self.engine)
            logger.info(f"Successfully fetched {len(df)} historical student records.")
            
            # Save raw data for traceability
            raw_dir = os.path.join(os.path.dirname(__file__), "..", "datasets", "raw")
            os.makedirs(raw_dir, exist_ok=True)
            raw_path = os.path.join(raw_dir, "historical_success_raw.csv")
            df.to_csv(raw_path, index=False)
            logger.info(f"Saved raw data to {raw_path}")
            
            return df
        except Exception as e:
            logger.error(f"Failed to fetch data from DB: {e}")
            raise
            
    def fetch_historical_forecasting_data(self) -> pd.DataFrame:
        """
        Aggregates historical data to predict future placement percentages.
        Replaces the synthetic linear random generator.
        """
        logger.info("Fetching historical forecasting data from PostgreSQL...")
        
        query = """
            SELECT 
                "academic_year" as year,
                COUNT(id) as total_students,
                SUM(CASE WHEN "placement_status" = 'Placed' THEN 1 ELSE 0 END) as placed_students,
                AVG(CASE WHEN "placement_status" = 'Placed' THEN "fixed_salary_lpa" ELSE NULL END) as average_package,
                MAX(CASE WHEN "placement_status" = 'Placed' THEN "fixed_salary_lpa" ELSE NULL END) as highest_package,
                COUNT(DISTINCT "company_id") as visiting_companies
            FROM "students"
            WHERE "academic_year" IS NOT NULL
            GROUP BY "academic_year"
            ORDER BY "academic_year" ASC
        """
        
        try:
            df = pd.read_sql(query, self.engine)
            
            # Calculate placement percentage
            if not df.empty and 'total_students' in df.columns:
                df['placement_percentage'] = (df['placed_students'] / df['total_students']) * 100
                df['placement_percentage'] = df['placement_percentage'].fillna(0)
            
            logger.info(f"Successfully fetched {len(df)} placement seasons for forecasting.")
            
            raw_dir = os.path.join(os.path.dirname(__file__), "..", "datasets", "raw")
            os.makedirs(raw_dir, exist_ok=True)
            raw_path = os.path.join(raw_dir, "historical_forecast_raw.csv")
            df.to_csv(raw_path, index=False)
            logger.info(f"Saved raw data to {raw_path}")
            
            return df
        except Exception as e:
            logger.error(f"Failed to fetch forecasting data from DB: {e}")
            raise

if __name__ == "__main__":
    ingestor = DataIngestion()
    ingestor.fetch_historical_success_data()
    ingestor.fetch_historical_forecasting_data()
