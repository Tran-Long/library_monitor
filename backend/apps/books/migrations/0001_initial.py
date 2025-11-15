# Generated migration for books app

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('shelves', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text='Book title (required)', max_length=255)),
                ('author', models.CharField(blank=True, help_text='Book author', max_length=255)),
                ('year', models.DateField(blank=True, help_text='Publication date', null=True)),
                ('short_description', models.CharField(blank=True, help_text='Brief description shown on cards', max_length=255)),
                ('long_description', models.TextField(blank=True, help_text='Detailed description shown in detail view')),
                ('status', models.CharField(choices=[('storage', 'Storage - Not on any shelf'), ('library', 'Library - On shelf'), ('borrowed', 'Borrowed - User borrowed')], default='storage', help_text='Book status/location', max_length=20)),
                ('borrow_date', models.DateTimeField(blank=True, help_text='Date when the book was borrowed', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('borrowed_by_user', models.ForeignKey(blank=True, help_text='User who borrowed the book', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='borrowed_books', to='users.user')),
                ('shelf', models.ForeignKey(blank=True, help_text='Shelf where book is stored', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='books', to='shelves.shelf')),
            ],
            options={
                'ordering': ['-created_at', 'title'],
            },
        ),
    ]
