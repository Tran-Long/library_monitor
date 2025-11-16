"""Admin configuration for books app."""
from django.contrib import admin
from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'year', 'date_format', 'shelf', 'created_at']
    list_filter = ['shelf', 'date_format']
    search_fields = ['title', 'author']
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'author', 'shelf')
        }),
        ('Publication Details', {
            'fields': ('year', 'date_format')
        }),
        ('Descriptions', {
            'fields': ('short_description', 'long_description')
        }),
        ('Status & Borrowing', {
            'fields': ('status', 'borrowed_by_user', 'borrow_date')
        }),
        ('System', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')
