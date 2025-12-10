"""Admin configuration for users."""
from django.contrib import admin
from .models import User, Department


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """Admin for User model."""
    list_display = ('full_name', 'phone', 'created_at')
    search_fields = ('full_name', 'phone')
    list_filter = ('created_at',)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin for Department model."""
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)

