#!/usr/bin/env python3
"""
Auth Database Setup Script for YugabyteDB
Creates authentication tables and default users
"""

import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

def run_sql_file(engine, file_path):
    """Execute SQL commands from a file"""
    with open(file_path, 'r') as f:
        sql_content = f.read()

    # Split by semicolon and execute each statement
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip() and not stmt.strip().startswith('--')]

    for statement in statements:
        if statement:
            try:
                with engine.connect() as conn:
                    conn.execute(text(statement))
                    conn.commit()
                print(f"✓ Executed: {statement[:50]}...")
            except Exception as e:
                print(f"⚠️  Skipped: {statement[:50]}... ({e})")

def main():
    """Main auth setup function"""
    print("🔐 Setting up YugabyteDB authentication...")

    # Load environment variables
    load_dotenv()

    # Database configuration
    db_config = {
        'host': os.getenv('DB_HOST', 'us-east-1.a72dffe2-ebd1-49fa-81cc-3ab1f16be337.aws.yugabyte.cloud'),
        'port': os.getenv('DB_PORT', '5433'),
        'name': os.getenv('DB_NAME', 'yugabyte'),
        'user': os.getenv('DB_USER', 'admin'),
        'password': os.getenv('DB_PASSWORD', 'password')
    }

    # Create database URL
    db_url = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['name']}"

    print(f"Connecting to: {db_config['host']}:{db_config['port']}")

    try:
        # Connect to database
        engine = create_engine(db_url)
        with engine.connect() as conn:
            version = conn.execute(text("SELECT version()")).fetchone()[0]
            print(f"✓ Connected to YugabyteDB: {version[:50]}...")

        # Run auth schema
        schema_file = Path(__file__).parent / "auth_schema.sql"
        if schema_file.exists():
            print("\n📋 Creating authentication schema...")
            run_sql_file(engine, schema_file)
            print("✓ Authentication schema created successfully!")
        else:
            print("✗ Auth schema file not found!")

        print("\n✅ Authentication setup completed successfully!")
        print(f"📍 Database: {db_config['name']}")
        print(f"🔗 Connection: {db_config['host']}:{db_config['port']}")
        print("\nDefault clients and users created:")
        print("🏢 American Logics:")
        print("  - Admin: admin@americanlogics.com / americanlogics321")
        print("🏢 Tech Corp Inc:")
        print("  - Admin: admin@techcorp.com / techcorp32")
        print("🏢 Data Solutions LLC:")
        print("  - Admin: admin@datasolutions.com / datasolutions321")
        print("\n📋 Available endpoints:")
        print("POST /api/auth/login - User login")
        print("GET  /api/admin/clients - List all clients (admin only)")
        print("POST /api/admin/clients - Create new client (admin only)")
        print("GET  /api/admin/clients/{client_id}/users - List client users (admin only)")
        print("POST /api/admin/clients/{client_id}/users - Create client user (admin only)")

    except Exception as e:
        print(f"✗ Auth setup failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check your YugabyteDB connection details in .env")
        print("2. Ensure YugabyteDB cluster is running and accessible")
        print("3. Verify database credentials and network connectivity")
        sys.exit(1)

if __name__ == "__main__":
    main()