from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import RegistrationForm, EntryForm
from .models import Entry, LoginLog
from django.http import JsonResponse
from django.views.decorators.http import require_POST
import json


def index(request):
    return redirect('login')

def register(request):
    if request.method == 'POST':
        form = RegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, 'Регистрация успешна!')
            return redirect('login')
        else:
            messages.error(request, 'Ошибка регистрации.')
    else:
        form = RegistrationForm()
    return render(request, 'diary/register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        from django.contrib.auth import authenticate, login
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            LoginLog.objects.create(
                user=user,
                ip_address=request.META.get('REMOTE_ADDR')
            )
            return redirect('diary')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль')
    return render(request, 'diary/login.html')

@login_required
def diary(request):
    if request.method == 'POST':
        form = EntryForm(request.POST, request.FILES)
        if form.is_valid():
            entry = form.save(commit=False)
            entry.user = request.user
            entry.save()
            messages.success(request, 'Запись добавлена!')
            return redirect('diary')
    else:
        form = EntryForm()
    
    entries = Entry.objects.filter(user=request.user)
    return render(request, 'diary/diary.html', {'form': form, 'entries': entries})

def public_entries(request):
    entries = Entry.objects.filter(is_public=True).order_by('-date_created')
    return render(request, 'diary/public_entries.html', {
        'entries': entries
    })

@login_required
@require_POST
def edit_entry(request, entry_id):
    try:
        entry = Entry.objects.get(id=entry_id, user=request.user)
        data = json.loads(request.body)
        entry.content = data['content']
        entry.save()
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

@login_required
@require_POST
def delete_entry(request, entry_id):
    try:
        entry = Entry.objects.get(id=entry_id, user=request.user)
        entry.delete()
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)