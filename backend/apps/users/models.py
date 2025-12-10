"""Models for users app."""
from django.db import models


class Department(models.Model):
    """Model for department."""
    
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class User(models.Model):
    """Model for user."""
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    full_name = models.CharField(max_length=255)
    dob = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='O')
    department = models.CharField(max_length=255, blank=True, null=True)
    short_description = models.CharField(max_length=255, blank=True, default='')
    long_description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['full_name']
    
    def __str__(self):
        return self.full_name
