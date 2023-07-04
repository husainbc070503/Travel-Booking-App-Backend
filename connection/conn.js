require('dotenv').config();
const mongoose = require('mongoose');
const url = process.env.MONGODB_URL

const connectToDB = async () => {
    mongoose.set('strictQuery', false)
    try {
        await mongoose.connect(url, () => console.log('Connection Established'))
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
};

module.exports = connectToDB

/* mongoose. set('useUnifiedTopology', true); The useUnifiedTopology option removes support for several connection options that are no longer relevant with the new topology engine: autoReconnect.
useNewUrlParser: Set to true to use the new MongoDB connection string parser. useUnifiedTopology: Set to true to use the new Server Discovery and Monitoring engine. authSource: The name of the database to use for authentication. This is typically the admin database. */