console.log('JavaScript loaded');

const themeToggle = document.getElementById('theme-toggle');
const darkThemeStyle = document.getElementById('dark-theme-style');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');


// Проверка localStorage и установка начального состояния
const savedTheme = localStorage.getItem('theme');

if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    darkThemeStyle.disabled = false;
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'inline-block';
} else { // Добавлено условие else
    document.body.classList.remove('dark-theme'); // Удаляем класс, если тема светлая
    darkThemeStyle.disabled = true;
    sunIcon.style.display = 'inline-block';
    moonIcon.style.display = 'none';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');

    // Логика для переключения CSS и иконок
    if (document.body.classList.contains('dark-theme')) {
        darkThemeStyle.disabled = false;
        localStorage.setItem('theme', 'dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'inline-block';
    } else {
        darkThemeStyle.disabled = true;
        localStorage.setItem('theme', 'light');
        sunIcon.style.display = 'inline-block';
        moonIcon.style.display = 'none';
    }
});

function toggleEdit(btn) {
    console.log('toggleEdit called');
    const entryItem = btn.closest('.entry-item');
    console.log('entryItem:', entryItem);

    const contentText = entryItem.querySelector('.content-text');
    const textarea = entryItem.querySelector('.edit-textarea');
    const editBtn = entryItem.querySelector('.edit-btn');
    const saveBtn = entryItem.querySelector('.save-btn');
    const cancelBtn = entryItem.querySelector('.cancel-btn');
    const entryTags = entryItem.querySelector('.entry-tags');

    textarea.value = contentText.textContent.trim();

    contentText.style.display = 'none';
    textarea.style.display = 'block';

    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';

    const entryTagsContainer = entryItem.querySelector('.entry-tags');
    const existingTags = Array.from(entryTagsContainer.querySelectorAll('.tag')).map(tag => tag.textContent);
    let tagInput = entryItem.querySelector('.tag-input');
    if (!tagInput) { // Create tag input if it doesn't exist
        tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.className = 'tag-input';
        tagInput.placeholder = 'Введите теги через запятую';
        entryTagsContainer.parentNode.insertBefore(tagInput, entryTagsContainer.nextSibling);
    }

    tagInput.value = existingTags.map(tag => `#${tag}`).join(', '); // Add # to existing tags

    textarea.focus();
}

function cancelEdit(btn) {
    const entryItem = btn.closest('.entry-item');
    const contentText = entryItem.querySelector('.content-text');
    const textarea = entryItem.querySelector('.edit-textarea');
    const editBtn = entryItem.querySelector('.edit-btn');
    const saveBtn = entryItem.querySelector('.save-btn');
    const cancelBtn = entryItem.querySelector('.cancel-btn');
    const tagInput = entryItem.querySelector('.tag-input');

    contentText.style.display = 'block';
    textarea.style.display = 'none';
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';

    if (tagInput) {
        tagInput.remove();
    }
}

async function saveEntry(btn) {
    const entryItem = btn.closest('.entry-item');
    const editUrl = entryItem.querySelector('.edit-url').dataset.url; // <---  Получение URL из data-url
    const textarea = entryItem.querySelector('.edit-textarea');
    const contentText = entryItem.querySelector('.content-text');
    const tagElements = entryItem.querySelectorAll('.entry-tags .tag');
    const tagIds = Array.from(tagElements).map(tag => tag.dataset.tagId);

    const tagInput = entryItem.querySelector('.tag-input');
    const tags = tagInput 
        ? tagInput.value.split(',') // split by comma
            .map(tag => tag.trim()) // remove whitespace
            .filter(tag => tag.startsWith('#')) // filter for tags starting with #
            .map(tag => tag.slice(1)) // remove the #
        : [];

    try {
        const response = await fetch(editUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                content: textarea.value.trim(),
                tags: tags
            })
        });

        if (response.ok) {
            // Update displayed content and tags
            contentText.textContent = textarea.value
            const entryTagsContainer = entryItem.querySelector('.entry-tags');
            renderTags(tags, entryTagsContainer);
            entryTagsContainer.innerHTML = ''; // Clear existing tags
            tags.forEach(tagName => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tagName;
                entryTagsContainer.appendChild(tagSpan);
            });
        } else {
            const errorData = await response.json();
            let errorMessage = 'Ошибка при сохранении';
            if (errorData && errorData.message) {
                errorMessage = errorData.message;
            }
            showNotification(errorMessage, 'error');

            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteEntry(btn) {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) {
        return;
    }

    const entryItem = btn.closest('.entry-item');
    const entryId = entryItem.dataset.entryId || entryItem.dataset['entry-id'];

    try {
        const response = await fetch(`/diary/delete/${entryId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            }
        });

        if (response.ok) {
            entryItem.style.animation = 'fadeOut 0.5s';
            setTimeout(() => {
                entryItem.remove();
                if (document.querySelectorAll('.entry-item').length === 0) {
                    const noEntries = document.createElement('li');
                    noEntries.className = 'no-entries';
                    noEntries.innerHTML = `
                        <div class="empty-state">
                            <span class="empty-icon">📝</span>
                            <p>Записей пока нет. Создайте свою первую запись!</p>
                        </div>
                    `;
                    document.querySelector('.entries-list').appendChild(noEntries);
                }
            }, 500);
            showNotification('Запись удалена!', 'success');
        } else {
            throw new Error('Ошибка при удалении');
        }
    } catch (error) {
        showNotification('Произошла ошибка при удалении', 'error');
        console.error('Error:', error);
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function renderTags(tags, container) {
    container.innerHTML = ''; // Clear existing tags
  
    tags.forEach(tagName => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'tag';
        tagSpan.textContent = `#${tagName}`; // Add # before tag name
        container.appendChild(tagSpan);
    });
  }