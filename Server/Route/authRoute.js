const express = require('express');
const router = express.Router();
const {Register, Login} = require('../Controller/authController');
const authMiddleware = require("../Middleware/authMiddleware");

router.use(authMiddleware);

router.post('/register',authMiddleware, Register)
router.post("/Login", Login)

module.exports = router