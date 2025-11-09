"""Models for borrowings app."""
from django.db import models
from apps.books.models import Book
from apps.customers.models import Customer


class Borrowing(models.Model):
    """Model for book borrowing record."""
    
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='borrowings')
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='borrowings')
    borrow_date = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-borrow_date']
    
    def __str__(self):
        return f"{self.customer} - {self.book} ({self.borrow_date.date()})"
    
    @property
    def is_returned(self):
        return self.return_date is not None
    
    @property
    def is_overdue(self):
        from django.utils import timezone
        if not self.is_returned:
            return self.due_date < timezone.now().date()
        return False
