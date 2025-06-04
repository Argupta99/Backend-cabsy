const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');
const userRoutes = require('./routes/user.route');
const rideRoutes = require('./routes/ride.route');
const captainRoutes = require('./routes/captain.route');
const mapRoutes = require('./routes/map.route');


connectToDb();


//config cors
app.use(cors());
app.use(express.json());

//urlencoded
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.get('/', (req, res) => {
    res.send('Hello World');
});

//config userRoutes
app.use('/users', userRoutes);
app.use('/rides', rideRoutes);
app.use('/captains', captainRoutes);
app.use('/map', mapRoutes);

module.exports = app;