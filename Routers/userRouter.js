const express = require('express');
const { signUp, logIn, generateOtp } = require('../Controllers/userController');

const router = express.Router();

//signup route
router.route('/signUp')
    .post(signUp);

router.route('/generateOtp')
    .post(generateOtp);
// Login route
router.route('/logIn').post(logIn);

module.exports = router;