# Generated by Django 5.1.3 on 2024-11-20 06:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('diary', '0004_alter_entry_attachment'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name='entry',
            name='tags',
            field=models.ManyToManyField(blank=True, related_name='entries', to='diary.tag'),
        ),
    ]
