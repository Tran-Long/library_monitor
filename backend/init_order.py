import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_monitor.settings')
django.setup()

from apps.libraries.models import Library

# Initialize order values
libs = Library.objects.all().order_by('created_at')
for idx, lib in enumerate(libs):
    lib.order = idx
    lib.save()
    print(f"Set {lib.name} order to {idx}")

print("\nFinal state:")
for lib in Library.objects.all().order_by('order'):
    print(f"  ID: {lib.id}, Name: {lib.name}, Order: {lib.order}")
