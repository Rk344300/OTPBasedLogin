const bcrypt = require('bcrypt');

const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');

const nodeMailer = require('../nodemailer');


const { User } = require('../Model/userModel');
const { Otp } = require("../Model/otpModel");

// signUp Controller
module.exports.signUp = async (req, res) => {

    const { email } = req.body;

    try {

        // if the user exist
        const user = await User.findOne({
            email: req.body.email
        });
        if (user) return res.status(400).send("user already exist");

        //register user in database

        const newUser = new User({ email });
        await newUser.save();
        return res.status(400).send("user register successfully");



    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'error in signing up' });
    }

}

module.exports.generateOtp = async (req, res) => {
    const { email } = req.body;
    try {

        const user = await User.findOne({ email });
        if (!user) return res.status(400).send("email not registered");

        // Check if there was a recent OTP request
        const currTime = new Date();
        const lastOtpRequest = await Otp.findOne({ email, otpExpiresAt: { $gt: currTime } });
        if (lastOtpRequest) {
            return res.status(429).json({ message: 'Please wait for 1 minute before generating a new OTP.' });
        }

        //generating new OTP
        const OTP = otpGenerator.generate(6, {
            digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false
        });

        const salt = await bcrypt.genSalt(10);
        const hashOtp = await bcrypt.hash(OTP, salt);

        // Save the OTP and its expiration time in the database
        const otpExpiration = new Date();
        otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);


        const newOtp = new Otp({ email: email, otp: hashOtp, otpExpiresAt: otpExpiration });
        await newOtp.save();



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


    } catch (error) {
        console.log(error);
        return res.status(400).send("error in generating an OTP");

    }
}

// Login Controller
module.exports.logIn = async (req, res) => {

    const { email, otp } = req.body;


    try {
        // check if user exist
        const user = await User.findOne({ email });

        if (!user) return res.status(400).send("User not found");

        // check if user is blocked
        if (user.isBlocked) {
            const leftTime = 10 - Math.ceil((Date.now() - user.lockedAt.getTime()) / (60 * 1000));
            if (leftTime > 0) {
                return res.status(403).json(`user is blocked .try again after ${leftTime} min`)
            } else {
                user.loginAttempts = 0;
                user.isBlocked = false;
                await user.save();
            }

        }




        const latestOTP = await Otp.findOne({ email })
            .sort({ createdAt: -1 })
            .exec();
        if (!latestOTP) {
            return res.status(401).send("Invaild Otp");
        }
        const userOtpIsValid = await bcrypt.compare(otp, latestOTP.otp);
        if (userOtpIsValid) {
            await Otp.deleteOne({ _id: latestOTP._id });
            user.loginAttempts = 0;

            await user.save();
            // Generate a new JWT token
            const token = jwt.sign({ email: user.email }, 'JWT_SECRETKEY', { expiresIn: '1h' });
            return res.status(200).json({ token: token });
        }



        if (userOtpIsValid == false) {
            user.loginAttempts += 1;

            // Check if the maximum login attempts are reached
            if (user.loginAttempts >= 5) {
                user.isBlocked = true;
                user.lockedAt = Date.now();
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




    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred during login' });
    }


}

