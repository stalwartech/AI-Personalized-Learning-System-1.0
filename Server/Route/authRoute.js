const express = require('express');
const router = express.Router();
const {Register, Login} = require('../Controller/authController')

router.post('/register', Register)
router.post("/Login", Login)

module.exports = router