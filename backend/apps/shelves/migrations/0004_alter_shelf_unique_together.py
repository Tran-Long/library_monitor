# Generated migration to remove unique_together constraint from Shelf model

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('shelves', '0003_remove_shelf_capacity'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='shelf',
            unique_together=set(),
        ),
    ]
