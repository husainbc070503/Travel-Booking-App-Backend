require('dotenv').config();
const { isUser, isAdmin } = require('../middleware/Middleware');
const Booking = require('../models/Booking');
const Flight = require('../models/Flights');
const router = require('express').Router();
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');

const rzp = new Razorpay({
    key_id: "rzp_test_FlqRfa8gpkyIvH",
    key_secret: "eArahzoMi3ZwNGpqOoPruXne"
})

const sendConfirmation = async (booking) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    const updateDate = (date) => date.split("-").reverse().join("/");

    const updateTime = (time) => {
        let arr = time.split(":");
        const temp = arr[0];
        arr[0] = arr[0] > 12 ? arr[0] - 12 : arr[0];
        return `${arr[0]}:${arr[1]} ${temp > 12 ? "pm" : "am"}`;
    }

    const numFormat = (num) => Intl.NumberFormat("en-IN").format(num);

    let message = `Your ticket has been confirmed. <br /> Ticket Details are as follows: <h2 style="display: inline-block;">${booking.flight.from}</h2> to <h2 style="display: inline-block;">${booking.flight.to}</h2> <br /> <h4>Total Price: Rs. ${numFormat(booking.totalPrice)} </h4> and <h4>BookedClass: ${booking.bookedClass} class. </h4> <br />
    <h4> Departure Date and Time: ${updateDate(booking.flight.departingDate)} ${updateTime(booking.flight.departureTime)} </h4>
    <h4> Duration: ${booking.flight.duration} </h4>
    <h2> Passengers List: </h2>
    <table border="1" style="border-collapse: collapse" >
    <tr>
    <th style="padding: 12px;">Sr.No.</th>
    <th style="padding: 12px;">Name</th>
    <th style="padding: 12px;">Age</th>
    <th style="padding: 12px;">Gender</th>
    <th style="padding: 12px;">Passport Number</th>
    </tr>
    `;

    booking.passengers.forEach((element, index) => {
        message += `
        <tr>
        <td style="padding: 12px;">${index + 1}</td>
        <td style="padding: 12px;">${element.name}</td>
        <td style="padding: 12px;">${element.age}</td>
        <td style="padding: 12px; text-transform: capitalize">${element.gender}</td>
        <td style="padding: 12px;">${element.passportNumber}</td>
        </tr>
        `
    });

    message += '</table>'

    const options = {
        from: process.env.USER,
        to: booking.user.email,
        subject: "Ticket Confirmation",
        html: message
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('Email sent successfully.');
                resolve(info);
            }
        })
    })
}

const cancelConfimation = async (booking) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        port: 587,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASSWORD
        },
        tls: { rejectUnauthorized: false }
    });

    let message = `<h2>Your ticket boarding ${booking.flight.airline} from ${booking.flight.from} to ${booking.flight.to} has been cancelled. Your payment will be refunded to you soon.</h2>
    <p>If it not you then please revert us through this mail.</p>
    <p>Thanking you.</p>
    `;

    const options = {
        from: process.env.USER,
        to: booking.user.email,
        subject: "Booking Cancelled Confirmation",
        html: message
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('Cancel Email Sent');
                resolve(info);
            }
        })
    })
}

router.post('/bookTicket', isUser, async (req, res) => {
    const { flight, bookingDateTime, bookedClass, noOfSeats, adults, children, passengers, totalPrice } = req.body;

    try {
        const bookedFlight = await Flight.findById(flight);
        let bookedSeats = bookedFlight.seats;

        bookedSeats = bookedSeats.map((seat) => {
            if (seat.class === bookedClass)
                seat.seatsAvailable = seat.seatsAvailable - noOfSeats;
            return seat;
        })

        const updateFlightDetails = await Flight.findByIdAndUpdate(bookedFlight._id, { seats: bookedSeats }, { new: true });

        let booking = await Booking.create({ user: req.user, flight: updateFlightDetails, bookedClass, noOfSeats, adults, children, passengers, totalPrice, bookingDateTime, });
        booking = await Booking.findById(booking._id).populate('user', '-password').populate('flight');

        if (booking) {
            const options = {
                payment_capture: 1,
                amount: booking.totalPrice * 100,
                currency: "INR"
            }

            try {
                const resp = await rzp.orders.create(options);
                sendConfirmation(booking);
                res.status(200).json({ success: true, booking, id: resp.id, totalPrice: resp.amount, currency: resp.currency });
            } catch (error) {
                res.status(400).json({ success: false, message: error.message })
            }
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.get('/getAllBookings', isUser, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('user', '-password')
            .populate('flight');
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.get('/getBookings', async (req, res) => {
    try {
        const bookings = await Booking.find().populate('user', '-password').populate('flight');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
})

router.delete('/cancelBooking/:id', isUser, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id)
            .populate('user', '-password')
            .populate('flight');

        cancelConfimation(booking);
        res.status(200).json({ success: true, booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});


module.exports = router;