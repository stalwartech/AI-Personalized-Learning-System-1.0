const express = require('express');
const dotenv = require('dotenv');
const app = express();
const cors = require('cors');

dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173'
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
    res.send('Hello World!');
});

// Working with the auth Route 
app.use("/", authRoute); //Register 
app.use("/", authRoute); //Login

// Routes
// app.use('/api/auth',     require('./routes/AuthRoutes'));
app.use('/api/courses',  require('./Route/courseRoute'));
app.use('/api/progress', require("./Route/progressRoute"));
app.use('/api/settings', require('./Route/settingsRoute'));


// Server
app.listen(Port, () => {
    console.log(`Server started on port ${Port}`);
});
