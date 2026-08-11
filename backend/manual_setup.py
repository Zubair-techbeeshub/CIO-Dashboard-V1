import os
from dotenv import load_dotenv
import psycopg2

# Load environment variables
load_dotenv()

# Database connection parameters
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

print("🔐 Database authentication setup is disabled.")
print("ℹ️  This application now runs without database authentication.")
print("ℹ️  Authentication will be implemented via Firebase in the future.")
print("ℹ️  This script is no longer needed and has been disabled.")