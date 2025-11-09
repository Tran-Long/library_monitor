"""Models for libraries app."""
from django.db import models


class Library(models.Model):
    """Model for library."""
    
    name = models.CharField(max_length=255, unique=True)
    short_description = models.CharField(max_length=255, blank=True, help_text="Brief description shown on cards")
    long_description = models.TextField(blank=True, help_text="Detailed description shown in detail view")
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    order = models.PositiveIntegerField(default=0, help_text="Order for display")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        verbose_name_plural = "Libraries"
    
    def __str__(self):
        return self.name
