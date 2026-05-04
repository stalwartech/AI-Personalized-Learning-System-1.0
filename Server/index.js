const express = require('express');
const dotenv = require('dotenv');
const app = express();
const cors = require('cors');

dotenv.config();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:3021',
  'https://ai-personalized-learning-system-1-0-ruby.vercel.app',
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .flatMap((origin) => origin.split(','))
  .map((origin) => origin.trim().replace(/\/$/, ''));

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const Port = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // make sure this is here too, to parse request bodies

// Database
const database = require("./config/db");
database()

// Routes
const authRoute = require("./Route/authRoute")


// Testing the route
app.get('/', (req, res) => {
    res.send('Backend Service Working Perfectly!');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend Service Working Perfectly!' });
});

// Working with the auth Route 
app.use("/api/auth", authRoute); // Login and Register
app.use("/", authRoute); // Backward compatibility for existing /login and /register clients

// Routes
// app.use('/api/auth',     require('./routes/AuthRoutes'));
app.use('/api/courses',  require('./Route/courseRoute'));
app.use('/api/progress', require("./Route/progressRoute"));
app.use('/api/settings', require('./Route/settingsRoute'));

app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});


// Server
app.listen(Port, () => {
    console.log(`Server started on port ${Port}`);
});
