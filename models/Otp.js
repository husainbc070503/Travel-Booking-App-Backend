const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },

    otp: {
        type: Number,
        required: true,
        default: 0
    },

    expiresIn: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

const Otp = mongoose.model('otp', OtpSchema);

module.exports = Otp;