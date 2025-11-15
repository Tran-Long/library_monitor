# Generated migration for libraries app

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Library',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('short_description', models.CharField(blank=True, help_text='Brief description shown on cards', max_length=255)),
                ('long_description', models.TextField(blank=True, help_text='Detailed description shown in detail view')),
                ('description', models.TextField(blank=True)),
                ('address', models.CharField(max_length=255)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('order', models.PositiveIntegerField(default=0, help_text='Order for display')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Libraries',
                'ordering': ['order', 'created_at'],
            },
        ),
    ]
