console.log('JavaScript loaded');

function toggleEdit(btn) {
    console.log('toggleEdit called');
    const entryItem = btn.closest('.entry-item');
    console.log('entryItem:', entryItem);

    const contentText = entryItem.querySelector('.content-text');
    const textarea = entryItem.querySelector('.edit-textarea');
    const editBtn = entryItem.querySelector('.edit-btn');
    const saveBtn = entryItem.querySelector('.save-btn');
    const cancelBtn = entryItem.querySelector('.cancel-btn');

    textarea.value = contentText.textContent.trim();

    contentText.style.display = 'none';
    textarea.style.display = 'block';

    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';

    textarea.focus();
}

function cancelEdit(btn) {
    const entryItem = btn.closest('.entry-item');
    const contentText = entryItem.querySelector('.content-text');
    const textarea = entryItem.querySelector('.edit-textarea');
    const editBtn = entryItem.querySelector('.edit-btn');
    const saveBtn = entryItem.querySelector('.save-btn');
    const cancelBtn = entryItem.querySelector('.cancel-btn');

    contentText.style.display = 'block';
    textarea.style.display = 'none';
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

async function saveEntry(btn) {
    const entryItem = btn.closest('.entry-item');
    const editUrl = entryItem.querySelector('.edit-url').dataset.url; // <---  Получение URL из data-url
    const textarea = entryItem.querySelector('.edit-textarea');
    const contentText = entryItem.querySelector('.content-text');

    try {
        const response = await fetch(editUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
            body: JSON.stringify({
                content: textarea.value.trim()
            })
        });

        if (response.ok) {
            contentText.textContent = textarea.value.trim();

            contentText.style.display = 'block';
            textarea.style.display = 'none';
            btn.style.display = 'none';
            entryItem.querySelector('.cancel-btn').style.display = 'none';
            entryItem.querySelector('.edit-btn').style.display = 'inline-block';

            showNotification('Запись успешно обновлена!', 'success');
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