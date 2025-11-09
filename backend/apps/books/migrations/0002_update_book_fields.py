# Generated migration to update Book model fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('books', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='book',
            name='isbn',
        ),
        migrations.RemoveField(
            model_name='book',
            name='publisher',
        ),
        migrations.RemoveField(
            model_name='book',
            name='publication_date',
        ),
        migrations.RemoveField(
            model_name='book',
            name='description',
        ),
        migrations.RemoveField(
            model_name='book',
            name='condition',
        ),
        migrations.RemoveField(
            model_name='book',
            name='is_available',
        ),
        migrations.AddField(
            model_name='book',
            name='year',
            field=models.IntegerField(blank=True, null=True, help_text='Publication year'),
        ),
        migrations.AddField(
            model_name='book',
            name='short_description',
            field=models.CharField(blank=True, max_length=255, help_text='Brief description shown on cards'),
        ),
        migrations.AddField(
            model_name='book',
            name='long_description',
            field=models.TextField(blank=True, help_text='Detailed description shown in detail view'),
        ),
        migrations.AlterField(
            model_name='book',
            name='author',
            field=models.CharField(blank=True, max_length=255, help_text='Book author'),
        ),
        migrations.AlterModelOptions(
            name='book',
            options={'ordering': ['created_at']},
        ),
    ]
