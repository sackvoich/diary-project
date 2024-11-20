from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse

def attachment_path(instance, filename):
    return f'attachments/{instance.user.id}/{filename}'

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class Entry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)  # Добавляем это поле
    attachment = models.FileField(upload_to=attachment_path, blank=True, null=True, validators=[]) # validators=[] убираем валидатор для FileField
    tags = models.ManyToManyField(Tag, related_name='entries', blank=True)

    def get_absolute_url(self):
        return reverse('edit_entry', kwargs={'entry_id': self.pk})


    class Meta:
        ordering = ['-date_created']
        verbose_name_plural = 'entries'

    def __str__(self):
        return f'{self.date_created.strftime("%Y-%m-%d %H:%M")} - {self.content[:50]}...'

class LoginLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    login_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-login_time']
