import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import psycopg2

# Load environment variables
load_dotenv()

# Database connection parameters
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

# Create connection string
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

print("🔍 Testing YugabyteDB connection...")
print(f"📍 Connecting to: {DB_HOST}:{DB_PORT}/{DB_NAME}")

try:
    # Test connection with psycopg2
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        sslmode="require"
    )
    print("✅ Connected successfully!")

    # Check if tables exist
    cursor = conn.cursor()
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = cursor.fetchall()

    print("\n📋 Tables in database:")
    if tables:
        for table in tables:
            print(f"  - {table[0]}")
    else:
        print("  No tables found")

    # Check clients table specifically
    cursor.execute("SELECT COUNT(*) FROM clients;")
    client_count = cursor.fetchone()[0]
    print(f"\n🏢 Clients in database: {client_count}")

    if client_count > 0:
        cursor.execute("SELECT client_id, name FROM clients;")
        clients = cursor.fetchall()
        for client in clients:
            print(f"  - {client[0]}: {client[1]}")

    # Check users table
    cursor.execute("SELECT COUNT(*) FROM users;")
    user_count = cursor.fetchone()[0]
    print(f"\n👥 Users in database: {user_count}")

    if user_count > 0:
        cursor.execute("SELECT email, first_name, last_name FROM users;")
        users = cursor.fetchall()
        for user in users:
            print(f"  - {user[0]}: {user[1]} {user[2]}")

    cursor.close()
    conn.close()

except Exception as e:
    print(f"❌ Connection failed: {e}")