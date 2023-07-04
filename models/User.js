const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    phone: {
        type: Number,
    },

    password: {
        type: String,
        required: true,
    },

    address: {
        type: String,
    },

    passportNumber: {
        type: String,
    },

    admin: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true
});

const User = mongoose.model('user', UserSchema);

module.exports = User;