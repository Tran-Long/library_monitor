"""Admin configuration for customers app."""
from django.contrib import admin
from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'phone', 'is_active', 'registration_date']
    list_filter = ['is_active', 'registration_date']
    search_fields = ['first_name', 'last_name', 'email']
