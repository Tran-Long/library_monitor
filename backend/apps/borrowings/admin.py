"""Admin configuration for borrowings app."""
from django.contrib import admin
from .models import Borrowing


@admin.register(Borrowing)
class BorrowingAdmin(admin.ModelAdmin):
    list_display = ['customer', 'book', 'borrow_date', 'due_date', 'return_date', 'is_overdue']
    list_filter = ['borrow_date', 'due_date', 'return_date']
    search_fields = ['customer__first_name', 'customer__last_name', 'book__title']
    readonly_fields = ['borrow_date', 'created_at', 'updated_at']
