const mongoose = require('mongoose');

//define the user schema
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },


    loginAttempts: {
        type: Number, default: 0
    },
    isBlocked: {
        type: Boolean, default: false
    },
    lockedAt: {
        type: Date
    },


}, { timestamps: true });

module.exports.User = mongoose.model("User", userSchema);

