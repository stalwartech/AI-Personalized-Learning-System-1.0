const authModel = require('../Model/authModel');
const bcrypt = require('bcryptjs');

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
            password: hashPassword
        });
        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { Register };
