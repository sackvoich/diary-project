# Generated by Django 5.1.3 on 2024-11-17 08:35

import diary.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('diary', '0003_entry_attachment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='entry',
            name='attachment',
            field=models.FileField(blank=True, null=True, upload_to=diary.models.attachment_path),
        ),
    ]
