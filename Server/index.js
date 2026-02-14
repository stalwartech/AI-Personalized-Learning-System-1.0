const express = require('express');
const app = express();
app.use(express.json());
const env = require('dotenv').config();

// All file imports here 
const {db} = require('./config/db')

const Port = process.env.PORT || 5000;

app.listen(Port, () => {
    console.log(`Server started on port ${Port}`);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});