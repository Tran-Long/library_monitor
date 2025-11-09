"""Admin configuration for libraries app."""
from django.contrib import admin
from .models import Library


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'phone', 'order', 'created_at']
    list_editable = ['order']
    search_fields = ['name', 'address']
