#!/bin/bash

# Script to create 3 libraries with bookshelves and shelves
# Library 1: 2 bookshelves
# Library 2: 3 bookshelves
# Library 3: 4 bookshelves
# Each bookshelf has 1 blank-name shelf

set -e

echo "🚀 Starting library structure creation..."

# Create a temporary Python script
TEMP_SCRIPT=$(mktemp)

cat > "$TEMP_SCRIPT" << 'EOF'
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_monitor.settings')
django.setup()

from apps.libraries.models import Library
from apps.bookshelves.models import Bookshelf
from apps.shelves.models import Shelf

# Libraries data
libraries_data = [
    {
        "name": "Downtown Library",
        "address": "123 Main Street",
        "phone": "555-1000",
        "email": "downtown@library.com",
        "short_description": "Main library branch in downtown",
        "long_description": "The main branch of our library system located in downtown with a comprehensive collection of books and resources.",
        "bookshelves_count": 2
    },
    {
        "name": "Riverside Library",
        "address": "456 River Road",
        "phone": "555-2000",
        "email": "riverside@library.com",
        "short_description": "Riverside community library",
        "long_description": "A community-focused library located by the riverside with modern facilities and diverse collections.",
        "bookshelves_count": 3
    },
    {
        "name": "Central Library",
        "address": "789 Central Avenue",
        "phone": "555-3000",
        "email": "central@library.com",
        "short_description": "Central library with extensive collection",
        "long_description": "The central hub of our library system featuring the largest collection of books, reference materials, and digital resources.",
        "bookshelves_count": 4
    },
]

# Create libraries with bookshelves and shelves
print("📚 Creating 3 libraries with bookshelves and shelves...\n")

for lib_data in libraries_data:
    bookshelves_count = lib_data.pop("bookshelves_count")
    
    # Create or get library
    library, lib_created = Library.objects.get_or_create(
        name=lib_data["name"],
        defaults={
            "address": lib_data.get("address", ""),
            "phone": lib_data.get("phone", ""),
            "email": lib_data.get("email", ""),
            "short_description": lib_data.get("short_description", ""),
            "long_description": lib_data.get("long_description", ""),
        }
    )
    
    if lib_created:
        print(f"✓ Created Library: {library.name}")
    else:
        print(f"→ Library already exists: {library.name}")
    
    # Create bookshelves for this library
    for shelf_num in range(1, bookshelves_count + 1):
        bookshelf_name = f"Bookshelf {shelf_num}"
        
        bookshelf, bs_created = Bookshelf.objects.get_or_create(
            library=library,
            name=bookshelf_name,
            defaults={
                "short_description": f"Bookshelf {shelf_num} in {library.name}",
                "location": f"Section {shelf_num}",
            }
        )
        
        if bs_created:
            print(f"  ✓ Created Bookshelf: {bookshelf.name}")
        else:
            print(f"  → Bookshelf already exists: {bookshelf.name}")
        
        # Create a blank-name shelf for this bookshelf
        shelf, shelf_created = Shelf.objects.get_or_create(
            bookshelf=bookshelf,
            name="",  # Blank name as requested
            defaults={
                "short_description": f"Shelf in {bookshelf.name}",
                "description": f"A shelf in {bookshelf.name} at {library.name}",
            }
        )
        
        if shelf_created:
            print(f"    ✓ Created Shelf (blank-name) in {bookshelf.name}")
        else:
            print(f"    → Shelf already exists in {bookshelf.name}")
    
    print()

# Print summary
print("\n📊 Summary:")
print(f"Total Libraries: {Library.objects.count()}")
print(f"Total Bookshelves: {Bookshelf.objects.count()}")
print(f"Total Shelves: {Shelf.objects.count()}")

# Detailed breakdown
for library in Library.objects.all().order_by('name'):
    bookshelves = library.bookshelves.count()
    shelves = Shelf.objects.filter(bookshelf__library=library).count()
    print(f"  • {library.name}: {bookshelves} bookshelves, {shelves} shelves")

print("\n✅ Library structure creation complete!")
EOF

# Run the population script inside the Docker container
echo "📦 Executing script in Docker container..."
docker compose exec -T backend python manage.py shell < "$TEMP_SCRIPT"

# Cleanup
rm -f "$TEMP_SCRIPT"

echo ""
echo "✨ Done! Your library structure has been created."
