<img src="frontend\src\components\custom\pudupurple.png" width="100">

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

\SysRev\backend py manage.py makemigrations
\SysRev\backend py manage.py migrate
\SysRev\backend py manage.py runserver #Run backend
```

### Frontend (React-Vite)  
```sh
\SysRev\frontend npm install #Install dependencies
\SysRev\frontend npm run dev #Run Frontend
```
