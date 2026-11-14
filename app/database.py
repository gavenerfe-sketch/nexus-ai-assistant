from app import db

def reset_database():
    """Utility function to recreate all database tables."""
    db.drop_all()
    db.create_all()
    print("Database tables recreated successfully.")
