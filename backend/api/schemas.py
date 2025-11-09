"""Schemas for serializing models."""
from ninja import Schema
from datetime import datetime, date
from typing import Optional


class LibrarySchema(Schema):
    """Schema for Library model."""
    id: int
    name: str
    short_description: str
    long_description: str
    description: str
    address: str
    phone: str
    email: str
    order: int
    created_at: datetime
    updated_at: datetime


class LibraryCreateSchema(Schema):
    """Schema for creating Library."""
    name: str
    short_description: str = ""
    long_description: str = ""
    description: str = ""
    address: str
    phone: str = ""
    email: str = ""
    order: int = 0


class BookshelfSchema(Schema):
    """Schema for Bookshelf model."""
    id: int
    library_id: int
    name: str
    short_description: str
    long_description: str
    description: str
    location: str
    order: int
    created_at: datetime
    updated_at: datetime


class BookshelfCreateSchema(Schema):
    """Schema for creating Bookshelf."""
    library_id: int
    name: str
    short_description: str = ""
    long_description: str = ""
    description: str = ""
    location: str = ""
    order: int = 0


class BookshelfUpdateSchema(Schema):
    """Schema for updating Bookshelf."""
    name: str
    short_description: str = ""
    long_description: str = ""
    description: str = ""
    location: str = ""
    order: int = 0


class ShelfSchema(Schema):
    """Schema for Shelf model."""
    id: int
    bookshelf_id: int
    name: Optional[str]
    short_description: str
    long_description: str
    description: str
    order: int
    created_at: datetime
    updated_at: datetime


class ShelfCreateSchema(Schema):
    """Schema for creating Shelf."""
    name: Optional[str] = None
    short_description: str = ""
    long_description: str = ""
    description: str = ""
    order: int = 0
    bookshelf_id: Optional[int] = None


class BookSchema(Schema):
    """Schema for Book model."""
    id: int
    shelf_id: Optional[int]
    title: str
    author: str = ""
    year: Optional[int]
    short_description: str = ""
    long_description: str = ""
    status: str = "storage"


class BookCreateSchema(Schema):
    """Schema for creating Book."""
    title: str
    author: str = ""
    year: Optional[int] = None
    short_description: str = ""
    long_description: str = ""
    status: str = "storage"


class BookMoveSchema(Schema):
    """Schema for moving a book to a shelf or storage."""
    shelf_id: Optional[int] = None
    status: Optional[str] = None


class CustomerSchema(Schema):
    """Schema for Customer model."""
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str
    address: str
    registration_date: datetime
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CustomerCreateSchema(Schema):
    """Schema for creating Customer."""
    first_name: str
    last_name: str
    email: str
    phone: str = ""
    address: str = ""
    is_active: bool = True


class BorrowingSchema(Schema):
    """Schema for Borrowing model."""
    id: int
    book_id: int
    customer_id: int
    borrow_date: datetime
    due_date: date
    return_date: Optional[date]
    notes: str
    created_at: datetime
    updated_at: datetime


class BorrowingCreateSchema(Schema):
    """Schema for creating Borrowing."""
    book_id: int
    customer_id: int
    due_date: date
    notes: str = ""


class UserSchema(Schema):
    """Schema for User model."""
    id: int
    full_name: str
    dob: Optional[date]
    phone: Optional[str]
    short_description: str
    long_description: str
    created_at: datetime
    updated_at: datetime


class UserCreateSchema(Schema):
    """Schema for creating User."""
    full_name: str
    dob: Optional[date] = None
    phone: Optional[str] = None
    short_description: str = ""
    long_description: str = ""


class ReorderSchema(Schema):
    """Schema for reordering items."""
    id: int
    order: int
