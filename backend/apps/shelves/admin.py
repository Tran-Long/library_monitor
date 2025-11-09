"""Admin configuration for shelves app."""
from django.contrib import admin
from .models import Shelf


@admin.register(Shelf)
class ShelfAdmin(admin.ModelAdmin):
    list_display = ['name', 'bookshelf', 'order', 'created_at']
    list_filter = ['bookshelf']
    list_editable = ['order']
    search_fields = ['name']
