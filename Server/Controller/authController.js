const authModel = require('../Model/authModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Register = async (req, res) => {
    const { fullName, email, password, verifytoken } = req.body;

    try {
        // Check if user exists
        const userExist = await authModel.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "Email already exist" });
        }

        // If User doesnt exist, then hash the password of t he new user
        const hashPassword = await bcrypt.hash(password, process.env.SALT);

        // Generate a token 
        const token = jwt.sign({id: emailExist._id}, process.env.SECRET_KEY, { expiresIn: "1d" });
        
        // Save the data of the user to the database system
        const user = await authModel.create({
            fullName,
            email,
            password: hashPassword,
            verifytoken: token
        });
        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const Login = async(req, res) => {
    const { email, password } = req.body;
    // Check if email exists 
    const emailExist = await authModel.findOne({ email });
    if(!emailExist){
        return res.status(400).json({ message: "Email not found" });
    }
    // Compare the password and the hashed password 
    const comparePassword = await bcrypt.compare(password, emailExist.password);
    if(!comparePassword){
        return res.status(400).json({ message: "Password is incorrect" });
    }
    // If they match then return the user details
    res.status(200).json(emailExist);
}

module.exports = { Register, Login };
