# Generated migration for users app

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=255)),
                ('dob', models.DateField(blank=True, null=True)),
                ('phone', models.CharField(blank=True, max_length=20, null=True)),
                ('gender', models.CharField(choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], default='O', max_length=1)),
                ('department', models.CharField(blank=True, max_length=255, null=True)),
                ('short_description', models.CharField(blank=True, default='', max_length=255)),
                ('long_description', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['full_name'],
            },
        ),
    ]
