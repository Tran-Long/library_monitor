"""Admin configuration for bookshelves app."""
from django.contrib import admin
from .models import Bookshelf


@admin.register(Bookshelf)
class BookshelfAdmin(admin.ModelAdmin):
    list_display = ['name', 'library', 'location', 'order', 'created_at']
    list_filter = ['library']
    list_editable = ['order']
    search_fields = ['name', 'location']
