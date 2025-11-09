"""Models for books app."""
from django.db import models
from apps.shelves.models import Shelf


class Book(models.Model):
    """Model for book."""
    
    STATUS_CHOICES = [
        ('storage', 'Storage - Not on any shelf'),
        ('library', 'Library - On shelf'),
        ('borrowed', 'Borrowed - User borrowed'),
    ]
    
    shelf = models.ForeignKey(Shelf, on_delete=models.CASCADE, related_name='books', null=True, blank=True, help_text="Shelf where book is stored")
    title = models.CharField(max_length=255, help_text="Book title (required)")
    author = models.CharField(max_length=255, blank=True, help_text="Book author")
    year = models.IntegerField(blank=True, null=True, help_text="Publication year")
    short_description = models.CharField(max_length=255, blank=True, help_text="Brief description shown on cards")
    long_description = models.TextField(blank=True, help_text="Detailed description shown in detail view")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='storage', help_text="Book status/location")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at', 'title']
    
    def __str__(self):
        return f"{self.title} by {self.author}"
