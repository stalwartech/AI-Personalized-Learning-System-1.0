const express = require('express');
const router = express.Router();
const {Register, Login} = require('../Controller/authController');
const authMiddleware = require("../Middleware/authMiddleware");

// router.use(authMiddleware);

router.post('/Register', Register)
router.post("/Login",authMiddleware, Login)

module.exports = router