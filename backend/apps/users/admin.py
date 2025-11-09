"""Admin configuration for users."""
from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin for User model."""
    list_display = ('full_name', 'phone', 'created_at')
    search_fields = ('full_name', 'phone')
    list_filter = ('created_at',)
