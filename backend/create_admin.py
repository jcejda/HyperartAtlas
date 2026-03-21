#!/usr/bin/env python3
"""
CLI script to create the first admin user.
Usage: python create_admin.py

This is an alternative to the POST /api/auth/setup-admin endpoint.
"""
import getpass
import sys

from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.core.security import hash_password


def main():
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count > 0:
            print("Users already exist in the database.")
            print("Use the API or database to manage roles.")
            sys.exit(1)

        print("=== Create First Admin User ===")
        email = input("Email: ").strip()
        if not email:
            print("Email is required.")
            sys.exit(1)

        username = input("Username: ").strip()
        if not username:
            print("Username is required.")
            sys.exit(1)

        password = getpass.getpass("Password (min 8 chars): ")
        if len(password) < 8:
            print("Password must be at least 8 characters.")
            sys.exit(1)

        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            print("Passwords do not match.")
            sys.exit(1)

        user = User(
            email=email,
            username=username,
            hashed_password=hash_password(password),
            role=UserRole.ADMIN,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        print(f"\nAdmin user created successfully!")
        print(f"  ID:       {user.id}")
        print(f"  Email:    {user.email}")
        print(f"  Username: {user.username}")
        print(f"  Role:     {user.role.value}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
