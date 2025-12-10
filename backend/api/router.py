"""API router for all endpoints."""
from ninja import Router, Query
from typing import List
from django.shortcuts import get_object_or_404
from django.db import models

from apps.libraries.models import Library
from apps.bookshelves.models import Bookshelf
from apps.shelves.models import Shelf
from apps.books.models import Book
from apps.borrowings.models import Borrowing
from apps.users.models import User, Department

from .schemas import (
    LibrarySchema, LibraryCreateSchema,
    BookshelfSchema, BookshelfCreateSchema, BookshelfUpdateSchema,
    ShelfSchema, ShelfCreateSchema,
    BookSchema, BookCreateSchema, BookMoveSchema,
    BorrowingSchema, BorrowingCreateSchema, BorrowBookSchema,
    UserSchema, UserCreateSchema,
    DepartmentSchema, DepartmentCreateSchema,
    ReorderSchema,
)

router = Router()

# ============= LIBRARY ENDPOINTS =============

@router.get("/libraries/", response=List[LibrarySchema])
def list_libraries(request):
    """List all libraries ordered by order field."""
    return Library.objects.all()


@router.post("/libraries/", response=LibrarySchema)
def create_library(request, payload: LibraryCreateSchema):
    """Create a new library."""
    library = Library.objects.create(**payload.dict())
    return library


@router.post("/libraries/reorder/")
def reorder_libraries(request, payload: List[ReorderSchema]):
    """Reorder libraries."""
    for item in payload:
        Library.objects.filter(id=item.id).update(order=item.order)
    return {"message": "Libraries reordered successfully"}


@router.get("/libraries/{library_id}/", response=LibrarySchema)
def get_library(request, library_id: int):
    """Get a specific library."""
    return get_object_or_404(Library, id=library_id)


@router.put("/libraries/{library_id}/", response=LibrarySchema)
def update_library(request, library_id: int, payload: LibraryCreateSchema):
    """Update a library."""
    library = get_object_or_404(Library, id=library_id)
    for attr, value in payload.dict().items():
        setattr(library, attr, value)
    library.save()
    return library


@router.patch("/libraries/{library_id}/", response=LibrarySchema)
def partial_update_library(request, library_id: int, payload: dict):
    """Partially update a library (for drag-and-drop reordering)."""
    library = get_object_or_404(Library, id=library_id)
    for attr, value in payload.items():
        if value is not None:
            setattr(library, attr, value)
    library.save()
    return library


@router.delete("/libraries/{library_id}/")
def delete_library(request, library_id: int):
    """Delete a library."""
    library = get_object_or_404(Library, id=library_id)
    library.delete()
    return {"message": "Library deleted successfully"}


@router.get("/libraries/{library_id}/bookshelves/", response=List[BookshelfSchema])
def list_library_bookshelves(request, library_id: int):
    """List all bookshelves for a specific library."""
    library = get_object_or_404(Library, id=library_id)
    return Bookshelf.objects.filter(library=library).order_by('order')


@router.post("/libraries/{library_id}/bookshelves/", response=BookshelfSchema)
def create_library_bookshelf(request, library_id: int, payload: BookshelfCreateSchema):
    """Create a new bookshelf in a specific library."""
    library = get_object_or_404(Library, id=library_id)
    # Override the library_id in the payload with the one from the URL
    data = payload.dict()
    data['library_id'] = library_id
    # Remove any null or empty values that might cause issues
    data = {k: v for k, v in data.items() if v is not None and v != ''}
    # Remove library_id if it exists and create with library instead
    data.pop('library_id', None)
    bookshelf = Bookshelf.objects.create(library=library, **data)
    return bookshelf


# ============= BOOKSHELF ENDPOINTS =============

@router.get("/bookshelves/", response=List[BookshelfSchema])
def list_bookshelves(request, library_id: int = Query(None)):
    """List all bookshelves, optionally filtered by library."""
    bookshelves = Bookshelf.objects.all().order_by('library_id', 'order')
    if library_id:
        bookshelves = bookshelves.filter(library_id=library_id)
    return bookshelves


@router.post("/bookshelves/", response=BookshelfSchema)
def create_bookshelf(request, payload: BookshelfCreateSchema):
    """Create a new bookshelf."""
    bookshelf = Bookshelf.objects.create(**payload.dict())
    return bookshelf


@router.post("/bookshelves/reorder/")
def reorder_bookshelves(request, payload: List[ReorderSchema]):
    """Reorder bookshelves."""
    for item in payload:
        Bookshelf.objects.filter(id=item.id).update(order=item.order)
    return {"message": "Bookshelves reordered successfully"}


@router.get("/bookshelves/{bookshelf_id}/", response=BookshelfSchema)
def get_bookshelf(request, bookshelf_id: int):
    """Get a specific bookshelf."""
    return get_object_or_404(Bookshelf, id=bookshelf_id)


@router.put("/bookshelves/{bookshelf_id}/", response=BookshelfSchema)
def update_bookshelf(request, bookshelf_id: int, payload: BookshelfUpdateSchema):
    """Update a bookshelf."""
    bookshelf = get_object_or_404(Bookshelf, id=bookshelf_id)
    for attr, value in payload.dict().items():
        setattr(bookshelf, attr, value)
    bookshelf.save()
    return bookshelf


@router.patch("/bookshelves/{bookshelf_id}/", response=BookshelfSchema)
def partial_update_bookshelf(request, bookshelf_id: int, payload: dict):
    """Partially update a bookshelf (for drag-and-drop reordering)."""
    bookshelf = get_object_or_404(Bookshelf, id=bookshelf_id)
    for attr, value in payload.items():
        if value is not None:
            setattr(bookshelf, attr, value)
    bookshelf.save()
    return bookshelf


@router.delete("/bookshelves/{bookshelf_id}/")
def delete_bookshelf(request, bookshelf_id: int):
    """Delete a bookshelf."""
    bookshelf = get_object_or_404(Bookshelf, id=bookshelf_id)
    bookshelf.delete()
    return {"message": "Bookshelf deleted successfully"}


# ============= NESTED SHELF ENDPOINTS =============

@router.get("/bookshelves/{bookshelf_id}/shelves/", response=List[ShelfSchema])
def list_bookshelf_shelves(request, bookshelf_id: int):
    """List all shelves for a specific bookshelf."""
    bookshelf = get_object_or_404(Bookshelf, id=bookshelf_id)
    return Shelf.objects.filter(bookshelf=bookshelf).order_by('order')


@router.post("/bookshelves/{bookshelf_id}/shelves/", response=ShelfSchema)
def create_bookshelf_shelf(request, bookshelf_id: int, payload: ShelfCreateSchema):
    """Create a new shelf in a specific bookshelf."""
    bookshelf = get_object_or_404(Bookshelf, id=bookshelf_id)
    data = payload.dict()
    data['bookshelf_id'] = bookshelf_id
    # Auto-assign order as the next number in sequence
    max_order = Shelf.objects.filter(bookshelf_id=bookshelf_id).aggregate(models.Max('order'))['order__max']
    data['order'] = (max_order if max_order is not None else -1) + 1
    shelf = Shelf.objects.create(**data)
    return shelf


# ============= SHELF ENDPOINTS =============

@router.get("/shelves/", response=List[ShelfSchema])
def list_shelves(request, bookshelf_id: int = Query(None)):
    """List all shelves, optionally filtered by bookshelf."""
    shelves = Shelf.objects.all().order_by('bookshelf_id', 'order')
    if bookshelf_id:
        shelves = shelves.filter(bookshelf_id=bookshelf_id)
    return shelves


@router.post("/shelves/", response=ShelfSchema)
def create_shelf(request, payload: ShelfCreateSchema):
    """Create a new shelf."""
    data = payload.dict()
    # Auto-assign order as the next number in sequence for the bookshelf
    max_order = Shelf.objects.filter(bookshelf_id=data['bookshelf_id']).aggregate(models.Max('order'))['order__max']
    data['order'] = (max_order if max_order is not None else -1) + 1
    shelf = Shelf.objects.create(**data)
    return shelf


@router.post("/shelves/reorder/")
def reorder_shelves(request, payload: List[ReorderSchema]):
    """Reorder shelves."""
    for item in payload:
        Shelf.objects.filter(id=item.id).update(order=item.order)
    return {"message": "Shelves reordered successfully"}


@router.get("/shelves/{shelf_id}/", response=ShelfSchema)
def get_shelf(request, shelf_id: int):
    """Get a specific shelf."""
    return get_object_or_404(Shelf, id=shelf_id)


@router.put("/shelves/{shelf_id}/", response=ShelfSchema)
def update_shelf(request, shelf_id: int, payload: ShelfCreateSchema):
    """Update a shelf."""
    shelf = get_object_or_404(Shelf, id=shelf_id)
    for attr, value in payload.dict().items():
        setattr(shelf, attr, value)
    shelf.save()
    return shelf


@router.delete("/shelves/{shelf_id}/")
def delete_shelf(request, shelf_id: int):
    """Delete a shelf."""
    shelf = get_object_or_404(Shelf, id=shelf_id)
    shelf.delete()
    return {"message": "Shelf deleted successfully"}

# ============= BOOK ENDPOINTS =============

@router.get("/books/", response=List[BookSchema])
def list_books(request, shelf_id: int = Query(None), status: str = Query(None)):
    """List all books, optionally filtered by shelf or status."""
    books = Book.objects.all()
    if shelf_id:
        books = books.filter(shelf_id=shelf_id)
    if status:
        books = books.filter(status=status)
    
    # Convert to schema and add computed fields
    result = []
    for book in books:
        # Create a dictionary from the model with all fields
        book_data = {
            'id': book.id,
            'shelf_id': book.shelf_id,
            'title': book.title,
            'author': book.author,
            'year': book.year,
            'date_format': book.date_format,
            'short_description': book.short_description,
            'long_description': book.long_description,
            'status': book.status,
            'borrow_date': book.borrow_date,
            'borrowed_by_user_id': book.borrowed_by_user_id,
            'borrowed_by_user_name': book.borrowed_by_user_name,
        }
        schema = BookSchema.model_validate(book_data)
        result.append(schema)
    return result


@router.get("/books/stats/")
def get_book_stats(request):
    """Get statistics about books by status."""
    return {
        "storage": Book.objects.filter(status='storage').count(),
        "library": Book.objects.filter(status='library').count(),
        "borrowed": Book.objects.filter(status='borrowed').count(),
        "total": Book.objects.count(),
    }


@router.get("/books/by-status/", response=dict)
def get_books_by_status(request):
    """Get books grouped by status."""
    def convert_books(books):
        result = []
        for book in books:
            book_data = {
                'id': book.id,
                'shelf_id': book.shelf_id,
                'title': book.title,
                'author': book.author,
                'year': book.year,
                'date_format': book.date_format,
                'short_description': book.short_description,
                'long_description': book.long_description,
                'status': book.status,
                'borrow_date': book.borrow_date,
                'borrowed_by_user_id': book.borrowed_by_user_id,
                'borrowed_by_user_name': book.borrowed_by_user_name,
            }
            schema = BookSchema.model_validate(book_data)
            result.append(schema)
        return result
    
    return {
        "storage": convert_books(Book.objects.filter(status='storage')),
        "library": convert_books(Book.objects.filter(status='library')),
        "borrowed": convert_books(Book.objects.filter(status='borrowed')),
    }

@router.get("/books/storage/", response=List[BookSchema])
def list_storage_books(request):
    """List all books in storage (not on any shelf)."""
    books = Book.objects.filter(shelf_id__isnull=True)
    
    # Convert to schema and add computed fields
    result = []
    for book in books:
        book_data = {
            'id': book.id,
            'shelf_id': book.shelf_id,
            'title': book.title,
            'author': book.author,
            'year': book.year,
            'date_format': book.date_format,
            'short_description': book.short_description,
            'long_description': book.long_description,
            'status': book.status,
            'borrow_date': book.borrow_date,
            'borrowed_by_user_id': book.borrowed_by_user_id,
            'borrowed_by_user_name': book.borrowed_by_user_name,
        }
        schema = BookSchema.model_validate(book_data)
        result.append(schema)
    return result


@router.post("/books/", response=BookSchema)
def create_book(request, payload: BookCreateSchema):
    """Create a new book."""
    data = payload.dict(exclude_none=True)
    # Set status based on shelf_id if not explicitly provided
    if 'status' not in data or data['status'] is None:
        data['status'] = 'library' if data.get('shelf_id') else 'storage'
    book = Book.objects.create(**data)
    return book


@router.post("/shelves/{shelf_id}/books/", response=BookSchema)
def create_shelf_book(request, shelf_id: int, payload: BookCreateSchema):
    """Create a new book in a specific shelf."""
    shelf = get_object_or_404(Shelf, id=shelf_id)
    data = payload.dict()
    data['shelf_id'] = shelf_id
    data['status'] = 'library'
    book = Book.objects.create(**data)
    return book


@router.get("/books/{book_id}/", response=BookSchema)
def get_book(request, book_id: int):
    """Get a specific book."""
    return get_object_or_404(Book, id=book_id)


@router.put("/books/{book_id}/", response=BookSchema)
def update_book(request, book_id: int, payload: BookCreateSchema):
    """Update a book."""
    book = get_object_or_404(Book, id=book_id)
    data = payload.dict(exclude_none=True)
    
    for attr, value in data.items():
        if attr == 'shelf_id':
            # Map shelf_id to shelf for the model
            setattr(book, 'shelf_id', value)
        else:
            setattr(book, attr, value)
    
    book.save()
    return book


@router.delete("/books/{book_id}/")
def delete_book(request, book_id: int):
    """Delete a book."""
    book = get_object_or_404(Book, id=book_id)
    book.delete()
    return {"message": "Book deleted successfully"}


@router.patch("/books/{book_id}/move/", response=BookSchema)
def move_book(request, book_id: int, payload: BookMoveSchema):
    """Move a book to a shelf or to storage (shelf_id=None)."""
    from django.http import JsonResponse
    
    book = get_object_or_404(Book, id=book_id)
    
    # Prevent moving borrowed books
    if book.borrowed_by_user is not None:
        return JsonResponse(
            {"error": "Cannot move borrowed book. Please return it first."},
            status=400
        )
    
    if payload.shelf_id:
        shelf = get_object_or_404(Shelf, id=payload.shelf_id)
        book.shelf = shelf
        book.status = 'library'
    else:
        book.shelf = None
        book.status = 'storage'
    book.save()
    return book


# ============= USER ENDPOINTS =============

@router.get("/users/", response=List[UserSchema])
def list_users(request):
    """List all users."""
    return User.objects.all()


@router.post("/users/", response=UserSchema)
def create_user(request, payload: UserCreateSchema):
    """Create a new user."""
    user = User.objects.create(**payload.dict())
    return user


@router.get("/users/{user_id}/", response=UserSchema)
def get_user(request, user_id: int):
    """Get a specific user."""
    return get_object_or_404(User, id=user_id)


@router.put("/users/{user_id}/", response=UserSchema)
def update_user(request, user_id: int, payload: UserCreateSchema):
    """Update a user."""
    user = get_object_or_404(User, id=user_id)
    for attr, value in payload.dict().items():
        setattr(user, attr, value)
    user.save()
    return user


@router.delete("/users/{user_id}/")
def delete_user(request, user_id: int):
    """Delete a user."""
    user = get_object_or_404(User, id=user_id)
    user.delete()
    return {"message": "User deleted successfully"}


# ============= DEPARTMENT ENDPOINTS =============

@router.get("/departments/", response=List[DepartmentSchema])
def list_departments(request):
    """List all departments."""
    return Department.objects.all()


@router.post("/departments/", response=DepartmentSchema)
def create_department(request, payload: DepartmentCreateSchema):
    """Create a new department."""
    # Check if department already exists (case-insensitive)
    existing = Department.objects.filter(name__iexact=payload.name).first()
    if existing:
        return existing
    department = Department.objects.create(**payload.dict())
    return department


@router.get("/departments/{department_id}/", response=DepartmentSchema)
def get_department(request, department_id: int):
    """Get a specific department."""
    return get_object_or_404(Department, id=department_id)


# ============= BORROWING ENDPOINTS =============


@router.get("/borrowings/", response=List[BorrowingSchema])
def list_borrowings(request, user_id: int = Query(None), is_returned: bool = Query(None)):
    """List all borrowings, optionally filtered by user or return status."""
    borrowings = Borrowing.objects.all()
    if user_id:
        borrowings = borrowings.filter(user_id=user_id)
    if is_returned is not None:
        if is_returned:
            borrowings = borrowings.exclude(return_date__isnull=True)
        else:
            borrowings = borrowings.filter(return_date__isnull=True)
    return borrowings


@router.post("/borrowings/", response=BorrowingSchema)
def create_borrowing(request, payload: BorrowingCreateSchema):
    """Create a new borrowing record."""
    book = get_object_or_404(Book, id=payload.book_id)
    book.is_available = False
    book.save()
    borrowing = Borrowing.objects.create(**payload.dict())
    return borrowing


@router.get("/borrowings/{borrowing_id}/", response=BorrowingSchema)
def get_borrowing(request, borrowing_id: int):
    """Get a specific borrowing record."""
    return get_object_or_404(Borrowing, id=borrowing_id)


@router.put("/borrowings/{borrowing_id}/", response=BorrowingSchema)
def update_borrowing(request, borrowing_id: int, payload: BorrowingCreateSchema):
    """Update a borrowing record."""
    borrowing = get_object_or_404(Borrowing, id=borrowing_id)
    for attr, value in payload.dict().items():
        setattr(borrowing, attr, value)
    borrowing.save()
    return borrowing


@router.delete("/borrowings/{borrowing_id}/")
def delete_borrowing(request, borrowing_id: int):
    """Delete a borrowing record."""
    borrowing = get_object_or_404(Borrowing, id=borrowing_id)
    borrowing.delete()
    return {"message": "Borrowing deleted successfully"}


@router.post("/borrowings/{borrowing_id}/return/")
def return_book(request, borrowing_id: int):
    """Mark a book as returned with optional custom return date and notes."""
    from django.utils import timezone
    from datetime import datetime
    import json
    
    borrowing = get_object_or_404(Borrowing, id=borrowing_id)
    
    # Get the request body
    body = {}
    try:
        if request.body:
            body = json.loads(request.body)
        else:
            body = {}
    except json.JSONDecodeError:
        body = {}
    
    # Get return_date from request body, default to now if not provided
    return_date_str = body.get('return_date')
    
    if return_date_str:
        try:
            # Parse ISO format datetime string
            return_date_str_clean = return_date_str.replace('Z', '+00:00')
            return_date = datetime.fromisoformat(return_date_str_clean)
            # If it's naive, make it aware as UTC
            if timezone.is_naive(return_date):
                return_date = timezone.make_aware(return_date, timezone.utc)
        except (ValueError, AttributeError, TypeError):
            return_date = timezone.now()
    else:
        return_date = timezone.now()
    
    # Get return_notes from request body
    return_notes = body.get('return_notes', '')
    
    # Update borrowing record
    borrowing.return_date = return_date
    borrowing.return_notes = return_notes
    borrowing.save()
    
    # Update book status
    book = borrowing.book
    book.status = 'storage'
    book.shelf_id = None
    book.borrowed_by_user = None
    book.save()
    
    return {"message": "Book returned successfully", "borrowing": BorrowingSchema.from_orm(borrowing)}


# ============= BOOK BORROW ENDPOINTS (with User) =============

@router.post("/books/{book_id}/borrow/{user_id}/")
def borrow_book(request, book_id: int, user_id: int):
    """Borrow a book for a user."""
    from django.utils import timezone
    from datetime import datetime
    from django.http import JsonResponse
    import json
    
    book = get_object_or_404(Book, id=book_id)
    user = get_object_or_404(User, id=user_id)
    
    # Check if book is already borrowed
    if book.borrowed_by_user is not None:
        return JsonResponse(
            {"error": f"Book is already borrowed by {book.borrowed_by_user.full_name}"},
            status=400
        )
    
    # Get the request body
    body = {}
    try:
        if request.body:
            body = json.loads(request.body)
        else:
            body = {}
    except json.JSONDecodeError:
        body = {}
    
    # Get borrow_time from request body, default to now if not provided
    borrow_time_str = body.get('borrow_time')
    
    if borrow_time_str:
        try:
            # Parse ISO format datetime string (e.g., "2025-11-10T14:30:00.000Z")
            # fromisoformat doesn't handle 'Z', so replace it
            borrow_time_str_clean = borrow_time_str.replace('Z', '+00:00')
            borrow_date = datetime.fromisoformat(borrow_time_str_clean)
            # If it's naive, make it aware as UTC
            if timezone.is_naive(borrow_date):
                borrow_date = timezone.make_aware(borrow_date, timezone.utc)
        except (ValueError, AttributeError, TypeError) as e:
            print(f"DEBUG Backend: Error parsing datetime '{borrow_time_str}': {e}")
            borrow_date = timezone.now()
    else:
        borrow_date = timezone.now()
    
    # Get notes from request body, default to empty string
    notes = body.get('notes', '')
    
    # Create a Borrowing record to track this borrowing session
    borrowing = Borrowing.objects.create(
        book=book,
        user=user,
        borrow_date=borrow_date,
        notes=notes
    )
    
    # Update book status to borrowed and set the user
    book.status = 'borrowed'
    book.borrowed_by_user = user
    book.borrow_date = borrowing.borrow_date
    book.shelf = None  # Remove from shelf when borrowed
    book.save()
    
    return {
        "message": f"Book '{book.title}' borrowed by {user.full_name}",
        "book": BookSchema.from_orm(book),
        "borrowing_id": borrowing.id,
        "user_id": user_id,
        "user_name": user.full_name,
        "borrow_date": book.borrow_date.isoformat(),
    }


@router.post("/books/{book_id}/return/")
def return_book_simple(request, book_id: int):
    """Return a borrowed book to storage."""
    from django.utils import timezone
    book = get_object_or_404(Book, id=book_id)
    
    # Find and update the active Borrowing record
    active_borrowing = Borrowing.objects.filter(
        book=book,
        return_date__isnull=True
    ).first()
    
    if active_borrowing:
        active_borrowing.return_date = timezone.now()
        active_borrowing.save()
    
    # Update book status back to storage and clear the borrowed user
    book.status = 'storage'
    book.shelf_id = None
    book.borrowed_by_user = None
    # Keep borrow_date for borrowing history - do not clear it
    book.save()
    
    return {
        "message": f"Book '{book.title}' returned to storage",
        "book": BookSchema.from_orm(book),
        "borrowing_id": active_borrowing.id if active_borrowing else None,
    }


@router.get("/books/{book_id}/borrowing-info/")
def get_book_borrowing_info(request, book_id: int):
    """Get borrowing information for a book."""
    book = get_object_or_404(Book, id=book_id)
    
    # Find active borrowing for this book
    active_borrowing = None
    active_user = None
    
    if book.status == 'borrowed':
        # In a real app, you'd have a field tracking who borrowed it
        # For now, we'll just indicate it's borrowed
        active_borrowing = {
            "book_id": book.id,
            "status": "borrowed",
            "borrowed_at": book.updated_at,
        }
    
    return {
        "book_id": book.id,
        "status": book.status,
        "borrowing": active_borrowing,
    }
