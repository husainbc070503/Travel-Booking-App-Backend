require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connectToDB = require('./connection/conn');
const port = process.env.PORT

app.use(cors());
connectToDB();

app.use(express.json());
app.get('/', (req, res) => res.send("Hello World"))

app.use('/api/user', require('./routes/User'));
app.use('/api/flight', require('./routes/Flight'));
app.use('/api/booking', require('./routes/Booking'));

app.listen(port, () => console.log(`Server running on port ${port}`))