const express = require('express');
const router = express.Router();
const {Register, Login} = require('../Controller/authController');
const authMiddleware = require("../Middleware/authMiddleware");

// router.use(authMiddleware);

router.post('/register', Register) // Working perfectly
router.post("/login", Login) // Working perfectly

module.exports = router