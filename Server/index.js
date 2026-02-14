const express = require('express');
const dotenv = require('dotenv');
const app = express();

dotenv.config();

const Port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Database
const database = require("./config/db");
database()

// Routes
const authRoute = require("./Route/authRoute")

// Test route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Working with the auth Route 
app.use("/", authRoute)

// Server
app.listen(Port, () => {
    console.log(`Server started on port ${Port}`);
});
