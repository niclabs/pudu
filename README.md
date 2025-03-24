# SysRev: Herramienta para Revisiones Sistemáticas

SysRev es una herramienta de apoyo para investigadores que permite crear repositorios de estudios científicos para revisiones sistemáticas. En este se pueden almacenar sus metadatos, categorizar usando tags, por ejemplo: según los temas que abordan, metodologías que utilizan, etc. También permite extraer información relevante de la revisión sistemática.

## Requisitos:
Es necesario instalar:  
- **Python 3**  
- **Node.js**  
- **npm**  

## Instalación y uso: 

### Backend (Django)  
```sh
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt  # Actualizar con: pip freeze > requirements.txt

\SysRev\backend py manage.py migrate
\SysRev\backend py manage.py runserver #Correr Backend
```

### Frontend (React-Vite)  
```sh
\SysRev\frontend npm install #Instalar dependencias
\SysRev\frontend npm run dev #Correr Frontend
```