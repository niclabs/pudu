<img src="frontend\src\assets\pudupurple.png" width="100">

# pudu: A Systematic Review Tool 

pudu is a tool to support researchers in creating and reviewing repositories of scientific literature for systematic reviews. 
Store study metadata, categorize using a heriarchical tag system, and retrieve relevant information about the systematic review.

## Requirements :  
- **Python 3**  
- **Node.js**  
- **npm**  

## Instalation and usage: 

### Backend (Django)  
```sh
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt  # Update using: pip freeze > requirements.txt

While in folder \pudu\backend:
py manage.py makemigrations
py manage.py migrate
py manage.py runserver #Run backend
```

### Frontend (React-Vite)  
```sh
While in folder \pudu\frontend:
npm install #Install dependencies
npm run dev #Run Frontend
```
