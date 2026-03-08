const authModel = require('../Model/authModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const env = require("dotenv").config();
const Register = async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        // Check if user exists
        const userExist = await authModel.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "Email already exist" });
        }

        // If User doesnt exist, then hash the password of t he new user
        const hashPassword = await bcrypt.hash(password, 10);        
       
        // Save the data of the user to the database system
        const user = await authModel.create({
            fullName,
            email,
            password: hashPassword,
        });
        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" , error: error.message});
    }
};

const Login = async(req, res) => {
    try {
        const { email, password } = req.body;
        // Check if email exists 
        const User = await authModel.findOne({ email });
        // console.log(User)

        if(!User){
            return res.status(400).json({ message: "Email not found" });
        }

        // Compare the password and the hashed password 
        const comparePassword = await bcrypt.compare(password, User.password);
        if(!comparePassword){
            return res.status(400).json({ message: "Password is incorrect" });
        }

        // Generate a token 
        const token = jwt.sign({id: User._id}, process.env.SECRET_KEY, { expiresIn: "1d" });   

        // If they match then return the user details
        res.status(200).json({User, token});
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = { Register, Login };
