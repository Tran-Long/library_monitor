# Generated migration for bookshelves app

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('libraries', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bookshelf',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('short_description', models.CharField(blank=True, help_text='Brief description shown on cards', max_length=255)),
                ('long_description', models.TextField(blank=True, help_text='Detailed description shown in detail view')),
                ('location', models.CharField(blank=True, max_length=255)),
                ('order', models.PositiveIntegerField(default=0, help_text='Order for display')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('library', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bookshelves', to='libraries.library')),
            ],
            options={
                'ordering': ['library', 'order', 'created_at'],
                'unique_together': {('library', 'name')},
            },
        ),
    ]
