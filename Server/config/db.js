const mongoose = require("mongoose");
const URI = process.env.URI
const db = mongoose.connect(URI, console.log("DB connected"));

module.exports = db