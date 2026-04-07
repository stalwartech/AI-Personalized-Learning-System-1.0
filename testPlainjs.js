const text = {
   "title": "Python for Web Development: A Beginner's Journey with Flask",
   "description": "This comprehensive beginner-level course introduces you to web development using Python and the Flask framework. Learn to build dynamic web applications from scratch, covering fundamental concepts, database integration, and basic deployment.",
   "category": "Web Development",
   "lessons": [
     {
       "title": "Introduction to Web Development with Python",
       "order": 1,
       "content": "Understand web dev basics, why Python, install Python, basic syntax (variables, functions). Example: `print(\"Hello\")`.",
       "estimatedDuration": 20
     },
     {
       "title": "Setting Up Your Development Environment",
       "order": 2,
       "content": "Install VS Code, create virtual environments (`python -m venv venv`), manage packages (`pip install flask`).",
       "estimatedDuration": 25
     },
     {
       "title": "Your First Web App with Flask",
       "order": 3,
       "content": "Introduce Flask, create a basic app (`app = Flask(__name__)`), define routes (`@app.route('/')`). Example: `@app.route('/')`.",
       "estimatedDuration": 20
     },
     {
       "title": "HTML Templates with Jinja2",
       "order": 4,
       "content": "Render dynamic HTML using Jinja2 templates (`render_template`), pass data. Example: `{{ name }}` in HTML.",
       "estimatedDuration": 25
     },
     {
       "title": "Handling User Input and Forms",
       "order": 5,
       "content": "Process GET/POST requests (`request.method`), create HTML forms, access form data (`request.form['name']`).",
       "estimatedDuration": 30
     },
     {
       "title": "Introduction to Databases with SQLite & SQLAlchemy",
       "order": 6,
       "content": "Understand databases, set up SQLite, basic SQLAlchemy models (`db.Model`, `db.Column`). Example: `class User(db.Model)`.",
       "estimatedDuration": 30
     },
     {
       "title": "Building a Simple CRUD Application",
       "order": 7,
       "content": "Implement Create, Read, Update, Delete (CRUD) for a resource using Flask and SQLAlchemy. Example: `User.query.all()`.",
       "estimatedDuration": 30
     },
     {
       "title": "Static Files and Styling Your App",
       "order": 8,
       "content": "Serve static files (CSS, JS) from `static` folder, link in templates (`url_for('static')`). Example: `<link href='style.css'>`.",
       "estimatedDuration": 20
     },
     {
       "title": "Basic Deployment Concepts",
       "order": 9,
       "content": "Understand deployment, prepare app for production, explore basic options (e.g., Heroku, Render).",
       "estimatedDuration": 25
     }
   ]
 }

 console.log(text.description);
 console.log(text.lessons.length);
 