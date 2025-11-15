"""Models for bookshelves app."""
from django.db import models
from apps.libraries.models import Library


class Bookshelf(models.Model):
    """Model for bookshelf."""
    
    library = models.ForeignKey(Library, on_delete=models.CASCADE, related_name='bookshelves')
    name = models.CharField(max_length=255)
    short_description = models.CharField(max_length=255, blank=True, help_text="Brief description shown on cards")
    long_description = models.TextField(blank=True, help_text="Detailed description shown in detail view")
    location = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0, help_text="Order for display")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['library', 'order', 'created_at']
        unique_together = ['library', 'name']
        verbose_name_plural = "Bookshelves"
    
    def __str__(self):
        return f"{self.library.name} - {self.name}"
