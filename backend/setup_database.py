#!/usr/bin/env python3
"""
Database Setup Script for YugabyteDB
Creates database, runs schema, and migrates data
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
    statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]

    with engine.connect() as conn:
        for statement in statements:
            if statement:
                try:
                    conn.execute(text(statement))
                    print(f"✓ Executed: {statement[:50]}...")
                except Exception as e:
                    print(f"⚠️  Skipped: {statement[:50]}... ({e})")
        conn.commit()

def main():
    """Main setup function"""
    print("🚀 Setting up YugabyteDB for CIO Dashboard...")

    # Load environment variables
    load_dotenv()

    # Database configuration
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5433'),
        'name': os.getenv('DB_NAME', 'cio_dashboard'),
        'user': os.getenv('DB_USER', 'yugabyte'),
        'password': os.getenv('DB_PASSWORD', 'password')
    }

    # Connect to default database first to create our database
    default_url = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/postgres"
    db_url = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['name']}"

    print(f"Connecting to: {db_config['host']}:{db_config['port']}")

    try:
        # Connect to default database
        engine = create_engine(default_url)
        with engine.connect() as conn:
            # Create database if it doesn't exist
            conn.execute(text(f"CREATE DATABASE {db_config['name']}"))
            print(f"✓ Created database: {db_config['name']}")
        engine.dispose()

        # Connect to our database
        engine = create_engine(db_url)
        with engine.connect() as conn:
            version = conn.execute(text("SELECT version()")).fetchone()[0]
            print(f"✓ Connected to YugabyteDB: {version[:50]}...")

        # Run schema
        schema_file = Path(__file__).parent / "database_schema.sql"
        if schema_file.exists():
            print("\n📋 Creating database schema...")
            run_sql_file(engine, schema_file)
            print("✓ Schema created successfully!")
        else:
            print("✗ Schema file not found!")

        # Run data migration
        print("\n📊 Migrating CSV data to database...")
        os.system("python migrate_data.py")

        print("\n✅ Database setup completed successfully!")
        print(f"📍 Database: {db_config['name']}")
        print(f"🔗 Connection: {db_config['host']}:{db_config['port']}")

    except Exception as e:
        print(f"✗ Setup failed: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure YugabyteDB is running")
        print("2. Check database credentials in .env file")
        print("3. Verify YugabyteDB is accepting connections on the specified port")
        sys.exit(1)

if __name__ == "__main__":
    main()