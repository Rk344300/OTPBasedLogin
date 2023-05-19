const bcrypt = require('bcrypt');

const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');

const nodeMailer = require('../nodemailer');


const { UserOtp } = require('../Model/userOtpModel');

// signUp Controller
module.exports.signUp = async (req, res) => {

    const { email } = req.body;

    try {


        // Check if there was a recent OTP request
        const currTime = new Date();
        const lastOtpRequest = await UserOtp.findOne({ email, otpExpiresAt: { $gt: currTime } });
        if (lastOtpRequest) {
            return res.status(429).json({ message: 'Please wait for 1 minute before generating a new OTP.' });
        }

        // if the user exist
        const user = await UserOtp.findOne({
            email: req.body.email
        });
        if (user) return res.status(400).send("user already exist");


        //generating OTP
        const OTP = otpGenerator.generate(6, {
            digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
        });

        const salt = await bcrypt.genSalt(10);
        const hashOtp = await bcrypt.hash(OTP, salt);

        // Save the OTP and its expiration time in the database
        const otpExpiration = new Date();
        otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

        //new user created
        const newUser = new UserOtp({ email: email, otp: hashOtp, otpExpiresAt: otpExpiration })
        const result = await newUser.save();



        const mailOptions = {
            from: process.env.TRANSPORTER_EMAIL,
            to: email,
            subject: 'OTP for Login',
            text: `Your OTP is: ${OTP}`,
        };
        nodeMailer.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ message: 'Failed to send OTP.' });
            }
            console.log('OTP sent:', info.response);
            res.json({ message: 'OTP sent successfully.' });
        });

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred.' });
    }

}

// Login Controller
module.exports.logIn = async (req, res) => {

    const { email, otp } = req.body;


    try {
        // check if user exist
        const user = await UserOtp.findOne({ email });

        if (!user) return res.status(400).send("User not found");

        // check if user is blocked
        if (user.isBlocked) return res.status(400).send("user is blocked ,please try after sometime");
        // console.log("user otp", user.otp);
        var userOtpIsValid = false;
        if (user.otp != undefined) {
            userOtpIsValid = await bcrypt.compare(otp, user.otp);
        }

        if (userOtpIsValid == false) {
            user.loginAttempts += 1;

            // Check if the maximum login attempts are reached
            if (user.loginAttempts >= 5) {
                user.isBlocked = true;
                await user.save();
                return res.status(403).json({ message: 'Your account is blocked. Please try again after 1 hour.' });
            }
            await user.save();
            return res.status(401).json({ message: 'Invalid OTP.' });
        }
        const currentTime = new Date();
        if (user.otpExpiresAt < currentTime) {
            return res.status(401).json({ message: 'OTP expired. Please generate a new OTP.' });
        }
        // Generate a new JWT token
        const token = jwt.sign({ email: user.email }, 'JWT_SECRETKEY', { expiresIn: '1h' });

        // Clear the OTP fields
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        user.loginAttempts = 0;
        await user.save();

        res.json({ token });


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred.' });
    }


}

