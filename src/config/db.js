const { default: mongoose } = require("mongoose");
require('dotenv').config();


const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Successfully connected to DB');
    }
    catch (error) {
        console.log('DB connection failed. ', error.message);
    }
}

module.exports = { connectDb }
