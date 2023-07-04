const { isAdmin } = require('../middleware/Middleware');
const Flight = require('../models/Flights');
const router = require('express').Router();

/* To convert a measurement in milliseconds to a measurement in days, divide the time by the following conversion ratio: 86,400,000 milliseconds/day. */

const updateDuration = (departingDate, departureTime, arrivingDate, arrivalTime) => {
    const arrival = new Date(`${arrivingDate} ${arrivalTime}`);
    const departure = new Date(`${departingDate} ${departureTime}`);

    const diff = arrival - departure;
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor(((diff % 86400000) / 3600000) % 24);
    const mins = Math.floor((((diff % 86400000) % 3600000) / 60000) % 60);
    return `${days}d ${hrs}h ${mins}m`;
}

router.post('/addFlight', isAdmin, async (req, res) => {
    const { airline, from, to, departingDate, departureTime, arrivingDate, arrivalTime, seats, image } = req.body;

    try {
        const calculatedDuration = updateDuration(departingDate, departureTime, arrivingDate, arrivalTime);

        const flight = await Flight.create({ airline, from, to, departingDate, departureTime, arrivingDate, arrivalTime, seats, duration: calculatedDuration, image });
        res.status(200).json({ success: true, flight });

    } catch (error) {
        res.status(400).json({ success: false, messge: error.message });
    }
});

router.get('/getAllFlights', async (req, res) => {
    try {
        const flights = await Flight.find();
        res.json({ success: true, flights });
    } catch (error) {
        res.status(400).json({ success: false, messge: error.message });
    }
})

router.get('/getFlight/:id', async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id);
        res.json({ success: true, flight });
    } catch (error) {
        res.status(400).json({ success: false, messge: error.message });
    }
})

router.post('/getFlightsByDateTime', async (req, res) => {
    const { from, to, dDate, time } = req.body;

    try {
        const flights = await Flight.find({ from, to, $or: [{ departingDate: { $gte: dDate } }, { departureTime: { $gte: time } }] });
        res.status(200).json({ success: true, flights });
    } catch (error) {
        res.status(400).json({ success: false, messge: error.message });
    }
});

router.put('/updateFlight/:id', isAdmin, async (req, res) => {
    const { airline, from, to, departingDate, departureTime, arrivingDate, arrivalTime, seats, image } = req.body;

    try {
        const updatedFlight = {};

        if (airline) updatedFlight.airline = airline;

        if (from) updatedFlight.from = from;

        if (to) updatedFlight.to = to;

        if (departingDate) updatedFlight.departingDate = departingDate;

        if (departureTime) updatedFlight.departureTime = departureTime;

        if (arrivingDate) updatedFlight.arrivingDate = arrivingDate;

        if (arrivalTime) updatedFlight.arrivalTime = arrivalTime;

        if (seats) updatedFlight.seats = [...seats];

        if (image) updatedFlight.image = image;

        updatedFlight.duration = updateDuration(updatedFlight.departingDate, updatedFlight.departureTime, updatedFlight.arrivingDate, updatedFlight.arrivalTime);

        const flight = await Flight.findByIdAndUpdate(req.params.id, updatedFlight, { new: true });
        res.status(200).json({ success: true, flight });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.delete('/deleteFlight/:id', isAdmin, async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, flight });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

module.exports = router;