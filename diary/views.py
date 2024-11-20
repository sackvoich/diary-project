from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import RegistrationForm, EntryForm
from .models import Entry, LoginLog, Tag
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

            # Process tags
            tag_names = form.cleaned_data['new_tags'].split(',')
            for tag_name in tag_names:
                tag_name = tag_name.strip()  # Remove extra whitespace
                if tag_name.startswith('#'):
                    tag_name = tag_name[1:]  # Remove the '#'
                if tag_name: # If tag_name is not empty:
                    tag, created = Tag.objects.get_or_create(name=tag_name)  # Create or get existing tag
                    entry.tags.add(tag) # Add the tag object to entry object.

            messages.success(request, 'Запись добавлена!')
            return redirect('diary')
    else:
        form = EntryForm()

    entries = Entry.objects.filter(user=request.user)
    return render(request, 'diary/diary.html', {'form': form, 'entries': entries})

def public_entries(request):
    tags = Tag.objects.all()
    tag_name = request.GET.get('tag')
    entries = Entry.objects.filter(is_public=True).order_by('-date_created')
    if tag_name:
        entries = entries.filter(tags__name=tag_name)
    return render(request, 'diary/public_entries.html', {
        'entries': entries,'tags' : tags, 'selected_tag' : tag_name
    })

@login_required
@require_POST
def edit_entry(request, entry_id):
    try:
        entry = Entry.objects.get(id=entry_id, user=request.user)
        data = json.loads(request.body)
        entry.content = data['content']

        # Tag Handling:
        new_tag_names = data.get('tags', []) # Get the tag names from the frontend.
        entry.tags.clear() # First clear existing tags for this entry.
        for tag_name in new_tag_names: # Iterate and create if doesn't exist, or get from db.
            tag, created = Tag.objects.get_or_create(name=tag_name)
            entry.tags.add(tag)
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