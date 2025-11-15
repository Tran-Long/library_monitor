"""Admin configuration for borrowings app."""
from django.contrib import admin
from .models import Borrowing


@admin.register(Borrowing)
class BorrowingAdmin(admin.ModelAdmin):
    list_display = ['user', 'book', 'borrow_date', 'return_date', 'is_returned', 'notes', 'return_notes']
    list_filter = ['borrow_date', 'return_date']
    search_fields = ['user__full_name', 'book__title']
    readonly_fields = ['borrow_date', 'created_at', 'updated_at']
