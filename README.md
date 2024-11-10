# Diary Project

## На русском

### Установка

1. Клонировать репозиторий
```bash
git clone https://github.com/sackvoich/diary-project.git
```

2. Создать виртуальное окружение и активировать его
```
python -m venv venv
source venv/bin/activate  # Для Linux/Mac
venv\Scripts\activate     # Для Windows
```

3. Установить зависимости
```
pip install -r requirements.txt
```

4. Создать файл .env на основе example.env и заполнить его

5. Применить миграции
```
python manage.py migrate
```

6. Запустить сервер
```
python manage.py runserver
```

## English

### How to Install

1. Clone the repository
```bash
git clone https://github.com/sackvoich/diary-project.git
```

2. Create the virtual envirionment and activate it
```
python -m venv venv
source venv/bin/activate  # Для Linux/Mac
venv\Scripts\activate     # Для Windows
```

3. Install the requirements
```
pip install -r requirements.txt
```

4. Create .env file (example.env to help:) and add it

5. Apply migrate
```
python manage.py migrate
```

6. Run the server
```
python manage.py runserver
```