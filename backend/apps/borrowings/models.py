"""Models for borrowings app."""
from django.db import models
from django.utils import timezone
from apps.books.models import Book
from apps.users.models import User


class Borrowing(models.Model):
    """Model for book borrowing record."""
    
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrowing_records')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='borrowing_records', null=True, blank=True)
    borrow_date = models.DateTimeField(default=timezone.now)
    return_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, help_text="Notes about the borrowing")
    return_notes = models.TextField(blank=True, help_text="Notes about the return")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-borrow_date']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.book.title} ({self.borrow_date.date()})"
    
    @property
    def is_returned(self):
        return self.return_date is not None
    
    @property
    def status(self):
        """Return the status of this borrowing record."""
        if self.return_date:
            return 'returned'
        return 'borrowing'
