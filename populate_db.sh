#!/bin/bash

# Script to populate the library database with sample data
# Adds 20 books to storage and creates 5 users

set -e

echo "🚀 Starting database population..."

# Create a temporary Python script
TEMP_SCRIPT=$(mktemp)

cat > "$TEMP_SCRIPT" << 'EOF'
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_monitor.settings')
django.setup()

from apps.books.models import Book
from apps.users.models import User
from datetime import datetime, date, timedelta

# Books data
books_data = [
    {"title": "The Great Gatsby", "author": "F. Scott Fitzgerald", "year": date(1925, 4, 10)},
    {"title": "To Kill a Mockingbird", "author": "Harper Lee", "year": date(1960, 7, 11)},
    {"title": "1984", "author": "George Orwell", "year": date(1949, 6, 8)},
    {"title": "Pride and Prejudice", "author": "Jane Austen", "year": date(1813, 1, 28)},
    {"title": "The Catcher in the Rye", "author": "J.D. Salinger", "year": date(1951, 7, 16)},
    {"title": "Brave New World", "author": "Aldous Huxley", "year": date(1932, 8, 30)},
    {"title": "The Hobbit", "author": "J.R.R. Tolkien", "year": date(1937, 9, 21)},
    {"title": "The Lord of the Rings", "author": "J.R.R. Tolkien", "year": date(1954, 7, 29)},
    {"title": "Jane Eyre", "author": "Charlotte Brontë", "year": date(1847, 10, 16)},
    {"title": "Wuthering Heights", "author": "Emily Brontë", "year": date(1847, 12, 19)},
    {"title": "Moby Dick", "author": "Herman Melville", "year": date(1851, 10, 18)},
    {"title": "War and Peace", "author": "Leo Tolstoy", "year": date(1869, 1, 1)},
    {"title": "Crime and Punishment", "author": "Fyodor Dostoevsky", "year": date(1866, 1, 1)},
    {"title": "The Brothers Karamazov", "author": "Fyodor Dostoevsky", "year": date(1879, 1, 1)},
    {"title": "Anna Karenina", "author": "Leo Tolstoy", "year": date(1877, 1, 1)},
    {"title": "The Odyssey", "author": "Homer", "year": date(1488, 1, 1)},
    {"title": "The Iliad", "author": "Homer", "year": date(1488, 1, 1)},
    {"title": "Don Quixote", "author": "Miguel de Cervantes", "year": date(1605, 1, 16)},
    {"title": "The Divine Comedy", "author": "Dante Alighieri", "year": date(1320, 1, 1)},
    {"title": "Dune", "author": "Frank Herbert", "year": date(1965, 6, 1)},
]

# Users data
users_data = [
    {
        "full_name": "Alice Johnson",
        "dob": date(1990, 3, 15),
        "phone": "555-0101",
        "gender": "F",
        "department": "Engineering",
        "short_description": "Software Developer"
    },
    {
        "full_name": "Bob Smith",
        "dob": date(1985, 7, 22),
        "phone": "555-0102",
        "gender": "M",
        "department": "Marketing",
        "short_description": "Marketing Manager"
    },
    {
        "full_name": "Carol White",
        "dob": date(1992, 11, 8),
        "phone": "555-0103",
        "gender": "F",
        "department": "Engineering",
        "short_description": "Product Manager"
    },
    {
        "full_name": "David Brown",
        "dob": date(1988, 5, 30),
        "phone": "555-0104",
        "gender": "M",
        "department": "Sales",
        "short_description": "Sales Representative"
    },
    {
        "full_name": "Emma Davis",
        "dob": date(1995, 2, 14),
        "phone": "555-0105",
        "gender": "F",
        "department": "HR",
        "short_description": "HR Specialist"
    },
]

# Add books
print("📚 Adding 20 books to storage...")
books_created = 0
for book_data in books_data:
    book, created = Book.objects.get_or_create(
        title=book_data["title"],
        author=book_data["author"],
        defaults={
            "year": book_data.get("year"),
            "status": "storage",
            "short_description": f"A classic by {book_data['author']}",
            "long_description": f"This is a classic literary work by {book_data['author']} published in {book_data.get('year', 'unknown date')}."
        }
    )
    if created:
        books_created += 1
        print(f"  ✓ Created: {book.title}")
    else:
        print(f"  → Already exists: {book.title}")

print(f"\n📊 Summary: Created {books_created} new books (total books in storage: {Book.objects.filter(status='storage').count()})")

# Add users
print("\n👥 Adding 5 users...")
users_created = 0
for user_data in users_data:
    user, created = User.objects.get_or_create(
        full_name=user_data["full_name"],
        defaults={
            "dob": user_data.get("dob"),
            "phone": user_data.get("phone"),
            "gender": user_data.get("gender", "O"),
            "department": user_data.get("department"),
            "short_description": user_data.get("short_description", ""),
            "long_description": f"User from {user_data.get('department', 'Unknown')} department"
        }
    )
    if created:
        users_created += 1
        print(f"  ✓ Created: {user.full_name} ({user.department})")
    else:
        print(f"  → Already exists: {user.full_name}")

print(f"\n📊 Summary: Created {users_created} new users (total users: {User.objects.count()})")
print("\n✅ Database population complete!")
EOF

# Run the population script inside the Docker container
echo ""
echo "📦 Executing script in Docker container..."
docker compose exec -T backend python manage.py shell < "$TEMP_SCRIPT"

# Cleanup
rm -f "$TEMP_SCRIPT"

echo ""
echo "✨ Done! Your database has been populated with sample data."
