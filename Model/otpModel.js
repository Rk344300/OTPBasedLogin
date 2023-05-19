const mongoose = require('mongoose');

//define the otp schema
const otpSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,

    },
    otpExpiresAt: {
        type: Date
    },



}, { timestamps: true });

module.exports.Otp = mongoose.model("Otp", otpSchema);

