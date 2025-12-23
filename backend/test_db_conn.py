from config import settings
from sqlalchemy import create_engine, text

print("Testing database connection...")
try:
    engine = create_engine(settings.database_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("Database connection OK")
except Exception as e:
    print(f"Database connection failed: {e}")