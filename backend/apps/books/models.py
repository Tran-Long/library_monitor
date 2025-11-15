"""Models for books app."""
from django.db import models
from apps.shelves.models import Shelf
from apps.users.models import User


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
    year = models.DateField(blank=True, null=True, help_text="Publication date")
    short_description = models.CharField(max_length=255, blank=True, help_text="Brief description shown on cards")
    long_description = models.TextField(blank=True, help_text="Detailed description shown in detail view")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='storage', help_text="Book status/location")
    borrowed_by_user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='borrowed_books', null=True, blank=True, help_text="User who borrowed the book")
    borrow_date = models.DateTimeField(blank=True, null=True, help_text="Date when the book was borrowed")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at', 'title']
    
    @property
    def borrowed_by_user_id(self):
        """Return the ID of the user who borrowed this book."""
        return self.borrowed_by_user.id if self.borrowed_by_user else None
    
    @property
    def borrowed_by_user_name(self):
        """Return the name of the user who borrowed this book."""
        return self.borrowed_by_user.full_name if self.borrowed_by_user else None
    
    def save(self, *args, **kwargs):
        """Override save to automatically set status based on shelf_id."""
        # If status is not 'borrowed', determine it based on shelf
        if self.status != 'borrowed':
            self.status = 'library' if self.shelf_id else 'storage'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.title} by {self.author}"
