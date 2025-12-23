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

print("🔐 Executing auth schema manually...")

try:
    # Connect to database
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        sslmode="require"
    )
    cursor = conn.cursor()

    # Read and execute the SQL file
    with open("auth_schema.sql", "r") as f:
        sql_content = f.read()

    # Execute the entire SQL content
    cursor.execute(sql_content)
    conn.commit()

    print("✅ Auth schema executed successfully!")

    # Check tables
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()

    print("\n📋 Tables created:")
    for table in tables:
        print(f"  - {table[0]}")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"❌ Error: {e}")