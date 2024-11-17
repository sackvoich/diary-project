from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Entry

class RegistrationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username', 'password1', 'password2']

class EntryForm(forms.ModelForm):
    ALLOWED_FILE_TYPES = ['png', 'jpg', 'jpeg', 'gif', 'pdf']

    class Meta:
        model = Entry
        fields = ['content', 'is_public', 'attachment']
        widgets = {
            'content': forms.Textarea(attrs={'rows': 5}),
            'is_public': forms.CheckboxInput(attrs={'class': 'privacy-checkbox'})
        }
        labels = {
            'content': 'Запись',
            'is_public': 'Сделать публичной',
            'attachment': 'Файл (png, jpg, jpeg, gif, pdf)'
        }

    def clean_attachment(self):
        attachment = self.cleaned_data.get('attachment')
        if attachment:
            file_type = attachment.name.split('.')[-1].lower()
            if file_type not in self.ALLOWED_FILE_TYPES:
                raise forms.ValidationError("Разрешены только файлы следующих типов: png, jpg, jpeg, gif, pdf.")
        return attachment