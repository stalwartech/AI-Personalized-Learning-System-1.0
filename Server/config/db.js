const mongoose = require("mongoose");
const URI = process.env.URI
const connectDB = async () => {
    try {
        await mongoose.connect(URI);
        console.log("Database is connected");
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB