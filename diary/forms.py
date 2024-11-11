from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Entry

class RegistrationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'password1', 'password2']

class EntryForm(forms.ModelForm):
    class Meta:
        model = Entry
        fields = ['content', 'is_public']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 5}),
            'is_public': forms.CheckboxInput(attrs={'class': 'privacy-checkbox'})
        }
        labels = {
            'content': 'Запись',
            'is_public': 'Сделать публичной'
        }