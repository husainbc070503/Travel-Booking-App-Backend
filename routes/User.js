require('dotenv').config();
const User = require('../models/User');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/GenerateToken');
const { isUser } = require('../middleware/Middleware');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');

const sendOTP = async (email, otp) => {
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

    const options = {
        from: process.env.USER,
        to: email,
        subject: 'OTP - Travel Booking App',
        html: `<h2>Your one time password is ${otp}. Make sure to use this otp within 5 mins else it gonna expire. 
        Do not share this otp with anyone.</h2>
        <h2>Thanking You.</h2>`
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('OTP Email Send');
                resolve(info);
            }
        })
    })
}

router.post('/register', async (req, res) => {
    const { name, email, address, password, passportNumber, phone, admin } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user)
            return res.status(400).json({ success: false, message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        user = await User.create({ name, email, password: secPass, address, passportNumber, phone, admin });
        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ success: false, message: 'Failed to fetch user. Please register.' });

        const result = await bcrypt.compare(password, user.password);
        if (!result)
            return res.status(400).json({ success: false, message: 'Invalid Credentials' });

        console.log(generateToken(user._id));
        res.status(200).json({ success: true, user: { user, token: generateToken(user._id) } });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.put('/updateProfile', isUser, async (req, res) => {
    const { name, email, address, phone, passportNumber } = req.body;

    try {
        const updateUser = {};
        if (name) updateUser.name = name;
        if (email) updateUser.email = email;
        if (address) updateUser.address = address;
        if (phone) updateUser.phone = phone;
        if (passportNumber) updateUser.passportNumber = passportNumber;

        const user = await User.findByIdAndUpdate(req.user._id, updateUser, { new: true });
        res.status(200).json({ success: true, user });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.post('/sendOTP', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: "No user with that email. Please register." });

        const otp = await Otp.create({
            email, otp: Math.floor(Math.random() * 10000),
            expiresIn: new Date().getTime() + 5 * 60 * 1000 // 5min
        });

        sendOTP(email, otp.otp);
        res.status(200).json({ success: true, otp });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
});

router.put('/changePassword', async (req, res) => {
    const { email, otp, password } = req.body;

    try {
        const token = await Otp.findOne({ email, otp });

        if (token) {
            const diff = token.expiresIn - new Date().getTime();
            if (diff < 0)
                return res.status(400).json({ success: false, message: 'OTP expired. Try again later.' });

            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(password, salt);

            const user = await User.findOneAndUpdate({ email }, { password: secPass }, { new: true });

            if (user)
                res.status(200).json({ success: true, user });
            else
                res.status(400).json({ success: false, message: "Failed to update password" });
        }
        else {
            res.status(400).json({ success: false, message: 'Token expired' });
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
})

module.exports = router;