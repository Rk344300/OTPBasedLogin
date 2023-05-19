const express = require('express');
const { signUp, logIn } = require('../Controllers/userController');

const router = express.Router();

//signup route
router.route('/signUp')
    .post(signUp);


// Login route
router.route('/logIn').post(logIn);

module.exports = router;