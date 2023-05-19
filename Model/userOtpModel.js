const mongoose = require('mongoose');

//define the user schema
const userOtpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,

    },
    otpExpiresAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },

}, { timestamps: true });

module.exports.UserOtp = mongoose.model("UserOtp", userOtpSchema);

