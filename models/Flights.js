const mongoose = require('mongoose');

const FlightSchema = new mongoose.Schema({
    airline: {
        type: String,
        required: true,
    },

    from: {
        type: String,
        required: true,
    },

    to: {
        type: String,
        required: true,
    },

    departingDate: {
        type: String,
        required: true,
    },

    departureTime: {
        type: String,
        required: true,
    },

    arrivingDate: {
        type: String,
        required: true,
    },

    arrivalTime: {
        type: String,
        required: true,
    },

    seats: [
        {
            class: {
                type: String,
                enum: ['Economy', 'Bussiness', 'First'],
                default: 'First',
            },

            seatsAvailable: {
                type: Number,
                default: 0,
                required: true,
            },

            pricePerSeat: {
                type: Number,
                default: 0,
                required: true,
            }
        }
    ],

    duration: {
        type: String,
        default: 0,
    },

    image: {
        type: String,
    }

}, {
    timestamps: true,
});

const Flight = mongoose.model('flight', FlightSchema);

module.exports = Flight