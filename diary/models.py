from django.db import models
from django.contrib.auth.models import User

class Entry(models.Model):
    content = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='entries')

    class Meta:
        ordering = ['-date_created']

class LoginLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    ip_address = models.GenericIPAddressField()
    login_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-login_time']