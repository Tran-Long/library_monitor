# Generated migration to remove capacity field from Shelf model

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shelves', '0002_shelf_long_description_shelf_short_description_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shelf',
            name='capacity',
        ),
    ]
