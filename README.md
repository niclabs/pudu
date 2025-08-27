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

Este proyecto es parte del trabajo de memoria de Andrés Basáez. Guiado por las profesoras Ivana Bachmann y Jocelyn Simmonds. El diseño se basa en una herramienta de revisión sistematica de la profesora Bachmann: [systematic-review-tool](https://github.com/tami-di/systematic-review-tool/tree/tami-updates)


### Trabajo futuro
A lo largo del desarrollo de este proyecto, surgen múltiples oportunidades de mejora. Estas aparecen en diversas formas cada vez que se implementa un componente, ya sea identificando asperezas, buscando feedback de usuarios, o al encontrar nuevas tecnologías y soluciones en el camino. Se itera varias veces sobre cada elemento de la herramienta para lograr entregar una solución más integral y robusta. Dicho esto, dadas las limitaciones de tiempo, siempre se busca priorizar aquellas tareas que generen un mayor impacto y valor para el producto final. Es por esto que algunas funcionalidades y mejoras quedan pendientes.

Se podrian abordar las historias de usuario opcionales. Estas incluyen la asociación de etiquetas a secciones del PDF lo que permitiría justificar su clasificación, y el desarrollo de una vista con gráficos y métricas. 

Hay elementos en la plataforma que podrian ser ajustado, por ejemplo, el sistema de lectura de PDFs. La solución actual funciona, pero puede ser mejorada. Actualmente, se trabaja con rutas de acceso en vez de almacenar los artículos, y esto requiere que los archivos pdf sean almacenados localmente en una carpeta específica para funcionar correctamente, lo cual es engorroso y poco amigable con usuarios nuevos. Queda pendiente investigar en más profundidad la legalidad de almacenar los artículos científicos, frecuentemente sujeta a derechos de autor, en la base de datos. La implementación en sí no es un problema mayor, ya que solo requeriría almacenar los archivos en vez de las rutas.

Un feedback común entre los participantes posterior a las pruebas es que algunos elementos interactivos, como botones, pueden pasar desapercibidos. Se han probado posterior a las pruebas alternativas visuales para demarcarlos mas claramente, pero queda pendiente buscar una solución final que responda a esta necesidad sin comprometer la claridad visual y simplicidad de las vistas.

Durante el transcurso del desarrollo, se plantea la idea de levantar la plataforma en un servidor, por lo que se implementa la primera parte del sistema de usuarios. Esto se inicia en las etapas finales del proyecto, para aprovechar el conocimiento que se tiene del modelo de datos y el backend de la plataforma, de tal manera que se pueda dejar una base sólida sobre la que se pueda trabajar en otra instancia. Sin embargo, quedan tareas pendientes, entre ellas, se encuentra la implementación del sistema de recuperación de contraseñas y el fortalecimiento del mecanismo de autenticación mediante el uso de refresh tokens, cuya integración fue iniciada pero no finalizada. Actualmente, la herramienta entrega tokens de larga duración al iniciar sesión; sin embargo, se espera migrar hacia un modelo más seguro, con tokens de corta duración que se renueven automáticamente mediante el backend.
