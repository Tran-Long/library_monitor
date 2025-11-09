"""Models for shelves app."""
from django.db import models
from apps.bookshelves.models import Bookshelf


class Shelf(models.Model):
    """Model for shelf."""
    
    bookshelf = models.ForeignKey(Bookshelf, on_delete=models.CASCADE, related_name='shelves')
    name = models.CharField(max_length=255, blank=True, null=True, help_text="Shelf name (optional)")
    short_description = models.CharField(max_length=255, blank=True, help_text="Brief description shown on cards")
    long_description = models.TextField(blank=True, help_text="Detailed description shown in detail view")
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0, help_text="Order for display")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['bookshelf', 'order', 'created_at']
    
    def __str__(self):
        return f"{self.bookshelf.name} - {self.name}"
