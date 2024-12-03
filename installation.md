Backend Django:
    python -m venv venv
    .\venv\Scripts\activate
    pip install -r requirements.txt (actualizado con pip freeze > requirements.txt)
    python manage.py migrate
    python manage.py createsuperuser
    python manage.py runserver
Front:
    npm install en carpeta frontend
    npm start