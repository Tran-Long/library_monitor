"""API router for all endpoints."""
from ninja import Router, Query
from typing import List
from django.shortcuts import get_object_or_404
from django.db import models

from apps.libraries.models import Library
from apps.bookshelves.models import Bookshelf
from apps.shelves.models import Shelf
from apps.books.models import Book
from apps.customers.models import Customer
from apps.borrowings.models import Borrowing
from apps.users.models import User

from .schemas import (
    LibrarySchema, LibraryCreateSchema,
    BookshelfSchema, BookshelfCreateSchema, BookshelfUpdateSchema,
    ShelfSchema, ShelfCreateSchema,
    BookSchema, BookCreateSchema, BookMoveSchema,
    CustomerSchema, CustomerCreateSchema,
    BorrowingSchema, BorrowingCreateSchema,
    UserSchema, UserCreateSchema,
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


@router.post("/libraries/reorder/")
def reorder_libraries(request, payload: List[ReorderSchema]):
    """Reorder libraries."""
    for item in payload:
        Library.objects.filter(id=item.id).update(order=item.order)
    return {"message": "Libraries reordered successfully"}


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
    bookshelf = Bookshelf.objects.create(**data)
    return bookshelf


# ============= BOOKSHELF ENDPOINTS =============

@router.get("/bookshelves/", response=List[BookshelfSchema])
def list_bookshelves(request, library_id: int = Query(None)):
    """List all bookshelves, optionally filtered by library."""
    bookshelves = Bookshelf.objects.all()
    if library_id:
        bookshelves = bookshelves.filter(library_id=library_id)
    return bookshelves


@router.post("/bookshelves/", response=BookshelfSchema)
def create_bookshelf(request, payload: BookshelfCreateSchema):
    """Create a new bookshelf."""
    bookshelf = Bookshelf.objects.create(**payload.dict())
    return bookshelf


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


@router.post("/bookshelves/reorder/")
def reorder_bookshelves(request, payload: List[ReorderSchema]):
    """Reorder bookshelves."""
    for item in payload:
        Bookshelf.objects.filter(id=item.id).update(order=item.order)
    return {"message": "Bookshelves reordered successfully"}


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
    data['order'] = (max_order or -1) + 1
    shelf = Shelf.objects.create(**data)
    return shelf


# ============= SHELF ENDPOINTS =============

@router.get("/shelves/", response=List[ShelfSchema])
def list_shelves(request, bookshelf_id: int = Query(None)):
    """List all shelves, optionally filtered by bookshelf."""
    shelves = Shelf.objects.all()
    if bookshelf_id:
        shelves = shelves.filter(bookshelf_id=bookshelf_id)
    return shelves


@router.post("/shelves/reorder/")
def reorder_shelves(request, payload: List[ReorderSchema]):
    """Reorder shelves."""
    for item in payload:
        Shelf.objects.filter(id=item.id).update(order=item.order)
    return {"message": "Shelves reordered successfully"}


@router.post("/shelves/", response=ShelfSchema)
def create_shelf(request, payload: ShelfCreateSchema):
    """Create a new shelf."""
    data = payload.dict()
    # Auto-assign order as the next number in sequence for the bookshelf
    max_order = Shelf.objects.filter(bookshelf_id=data['bookshelf_id']).aggregate(models.Max('order'))['order__max']
    data['order'] = (max_order or -1) + 1
    shelf = Shelf.objects.create(**data)
    return shelf


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
    return books


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
    return {
        "storage": [BookSchema.from_orm(b) for b in Book.objects.filter(status='storage')],
        "library": [BookSchema.from_orm(b) for b in Book.objects.filter(status='library')],
        "borrowed": [BookSchema.from_orm(b) for b in Book.objects.filter(status='borrowed')],
    }

@router.get("/books/storage/", response=List[BookSchema])
def list_storage_books(request):
    """List all books in storage (not on any shelf)."""
    return Book.objects.filter(shelf_id__isnull=True)


@router.post("/books/", response=BookSchema)
def create_book(request, payload: BookCreateSchema):
    """Create a new book."""
    book = Book.objects.create(**payload.dict())
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
    for attr, value in payload.dict().items():
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
    book = get_object_or_404(Book, id=book_id)
    if payload.shelf_id:
        shelf = get_object_or_404(Shelf, id=payload.shelf_id)
        book.shelf = shelf
        book.status = 'library'
    else:
        book.shelf = None
        book.status = 'storage'
    book.save()
    return book


# ============= CUSTOMER ENDPOINTS =============

@router.get("/customers/", response=List[CustomerSchema])
def list_customers(request, is_active: bool = Query(None)):
    """List all customers, optionally filtered by active status."""
    customers = Customer.objects.all()
    if is_active is not None:
        customers = customers.filter(is_active=is_active)
    return customers


@router.post("/customers/", response=CustomerSchema)
def create_customer(request, payload: CustomerCreateSchema):
    """Create a new customer."""
    customer = Customer.objects.create(**payload.dict())
    return customer


@router.get("/customers/{customer_id}/", response=CustomerSchema)
def get_customer(request, customer_id: int):
    """Get a specific customer."""
    return get_object_or_404(Customer, id=customer_id)


@router.put("/customers/{customer_id}/", response=CustomerSchema)
def update_customer(request, customer_id: int, payload: CustomerCreateSchema):
    """Update a customer."""
    customer = get_object_or_404(Customer, id=customer_id)
    for attr, value in payload.dict().items():
        setattr(customer, attr, value)
    customer.save()
    return customer


@router.delete("/customers/{customer_id}/")
def delete_customer(request, customer_id: int):
    """Delete a customer."""
    customer = get_object_or_404(Customer, id=customer_id)
    customer.delete()
    return {"message": "Customer deleted successfully"}


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


# ============= BORROWING ENDPOINTS =============

@router.get("/borrowings/", response=List[BorrowingSchema])
def list_borrowings(request, customer_id: int = Query(None), is_returned: bool = Query(None)):
    """List all borrowings, optionally filtered by customer or return status."""
    borrowings = Borrowing.objects.all()
    if customer_id:
        borrowings = borrowings.filter(customer_id=customer_id)
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
    """Mark a book as returned."""
    from django.utils import timezone
    borrowing = get_object_or_404(Borrowing, id=borrowing_id)
    borrowing.return_date = timezone.now().date()
    borrowing.save()
    book = borrowing.book
    book.is_available = True
    book.save()
    return {"message": "Book returned successfully", "borrowing": BorrowingSchema.from_orm(borrowing)}
