"""Admin configuration for books app."""
from django.contrib import admin
from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'year', 'shelf', 'created_at']
    list_filter = ['shelf']
    search_fields = ['title', 'author']
