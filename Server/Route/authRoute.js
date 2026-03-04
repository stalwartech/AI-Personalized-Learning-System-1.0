const express = require('express');
const router = express.Router();
const {Register, Login} = require('../Controller/authController');
const authMiddleware = require("../Middleware/authMiddleware");

// router.use(authMiddleware);

router.post('/Register', Register) // Working perfectly
router.post("/Login", Login) // Working perfectly

module.exports = router