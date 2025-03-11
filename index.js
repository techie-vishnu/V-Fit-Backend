const express = require('express');
const app = express();
require('dotenv').config();
const { connectDb } = require('./src/config/db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// const productRoutes = require('./src/routes/productRoutes');
const authRoutes = require('./src/routes/authRoutes');
const membershipRoutes = require('./src/routes/membershipRoutes')

// Connect to DB
connectDb();

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

// cookieParser middleware
app.use(cookieParser());

// Routes
app.use('/api', authRoutes);
app.use('/api', membershipRoutes);
app.use('/', (req, res) => {
    res.send("Welcome");
});


// Run app
app.listen(process.env.PORT, (error) => {
    if (!error)
        console.log("Server is successfully running, app is running in http://localhost:" + process.env.PORT);
    else
        console.log("Error occured, server can't start!!", error);
});