const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    flight: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'flight'
    },

    adults: {
        type: Number,
        required: true,
    },

    children: {
        type: Number,
        required: true,
    },

    bookedClass: {
        type: String,
        enum: ['First', 'Bussiness', 'Economy'],
        required: true,
    },

    noOfSeats: {
        type: Number,
        required: true,
    },

    passengers: [
        {
            name: {
                type: String,
                required: true,
            },

            age: {
                type: Number,
                required: true,
            },

            gender: {
                type: String,
                required: true,
                enum: ['male', 'female'],
            },

            passportNumber: {
                type: String,
                required: true,
            },
        }
    ],

    totalPrice: {
        type: Number,
        required: true,
    },

    bookingDateTime: {
        type: String,
        required: true,
    },

}, { timestamps: true });

const Booking = mongoose.model('booking', BookingSchema);

module.exports = Booking;