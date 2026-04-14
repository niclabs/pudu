<img src="frontend\src\assets\pudupurple.png" width="100">

# pudu: A Systematic Review Tool 

pudu is a tool to support researchers in creating and reviewing repositories of scientific literature for systematic reviews. 
Store study metadata, categorize using a heriarchical tag system, and retrieve relevant information about the systematic review.

This project is part of Andrés Basáez's thesis work. Guided by professors Ivana Bachmann and Jocelyn Simmonds. The design is based on a systematic review tool by professor Bachmann: [systematic-review-tool](https://github.com/tami-di/systematic-review-tool/tree/tami-updates)


## Requirements :  
- **Python 3**  
- **Node.js**  
- **npm**  

Before starting, ensure the requirements are correctly installed in your terminal:
```sh
python --version  # or python3 --version
node --version
npm --version
```

## Installation and usage: 
First, copy the repository and navigate to it with 
```sh
git clone https://github.com/niclabs/pudu.git
cd pudu
```
Create and activate a virtual environment, then install the required dependencies.

**Windows:**
```sh
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

**macOS and Linux:**
```sh
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
If you see errors like "case builtin used outside of a switch block", you are probably using the fish shell. Use `activate.fish` instead of `activate`.

Now, you can start the Django server and the React application.

### Backend (Django)
Open a new terminal on the pudu directory, activate the virtual environment and paste the following commands.

```sh
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend (React-Vite)
Open a new terminal on the pudu directory, activate the virtual environment, and paste the following commands.

```sh
cd frontend
npm install
npm run dev
```



## License 
The pudu proyect is open-sourced software licensed under the MIT license.

