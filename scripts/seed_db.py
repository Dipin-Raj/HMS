import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models.user import User as DBUser
from backend.app.core.security import get_password_hash

def seed_db():
    db: Session = SessionLocal()

    demo_accounts = [
        {'username': 'patient', 'email': 'patient@hospital.com', 'password': 'patient123', 'role': 'patient'},
        {'username': 'doctor', 'email': 'doctor@hospital.com', 'password': 'doctor123', 'role': 'doctor'},
        {'username': 'staff', 'email': 'staff@hospital.com', 'password': 'staff123', 'role': 'staff'},
        {'username': 'admin', 'email': 'admin@hospital.com', 'password': 'admin123', 'role': 'admin'},
        {'username': 'pharmacy', 'email': 'pharmacy@hospital.com', 'password': 'pharmacy123', 'role': 'pharmacy'},
    ]

    try:
        print("Seeding database with demo users...")
        for account in demo_accounts:
            # Check if user already exists
            db_user = db.query(DBUser).filter(DBUser.username == account['username']).first()
            if not db_user:
                hashed_password = get_password_hash(account['password'])
                new_user = DBUser(
                    username=account['username'],
                    email=account['email'],
                    password_hash=hashed_password,
                    role=account['role']
                )
                db.add(new_user)
                print(f"Added user: {account['username']} ({account['role']})")
        
        db.commit()
        print("Database seeding successful!")

    except Exception as e:
        print(f"An error occurred during database seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Note: This script needs the DATABASE_URL to be set in the .env file in the root directory.
    # The script should be run from the root directory of the project, e.g., `python scripts/seed_db.py`
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        print("Error: .env file not found.")
        print("Please create a .env file in the root directory and set the DATABASE_URL.")
        print("You can use the .env.example file as a template.")
        sys.exit(1)
        
    seed_db()
