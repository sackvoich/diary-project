from django.db import models
from django.contrib.auth.models import User

class Entry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    is_public = models.BooleanField(default=False)  # Добавляем это поле
    attachment = models.FileField(upload_to='attachments/', blank=True, null=True)

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