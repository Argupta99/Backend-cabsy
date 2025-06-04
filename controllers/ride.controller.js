const rideService = require('../services/ride.service');
const mapService = require('../services/maps.service');
const { validationResult } = require('express-validator');
const rideModel = require('../models/ride.model');
const { sendMessageToSocketId } = require('../socket');


module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, captainId, pickup, destination, vehicleType } = req.body;

    try {
        // ✅ Get pickup coordinates
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        console.log("Received Pickup Coordinates:", pickupCoordinates);

        // ✅ Validate pickup coordinates before using them
        if (!pickupCoordinates || 
            typeof pickupCoordinates.lat !== 'number' || 
            typeof pickupCoordinates.lng !== 'number') {
            console.error("❌ Error: Invalid pickup location detected:", pickupCoordinates);
            return res.status(400).json({ error: "Invalid pickup location. Coordinates missing or incorrect." });
        }

        // ✅ Get destination coordinates
        const destinationCoordinates = await mapService.getAddressCoordinate(destination);
        console.log("Received Destination Coordinates:", destinationCoordinates);

        // ✅ Validate destination coordinates
        if (!destinationCoordinates || 
            typeof destinationCoordinates.lat !== 'number' || 
            typeof destinationCoordinates.lng !== 'number') {
            console.error("❌ Error: Invalid destination location detected:", destinationCoordinates);
            return res.status(400).json({ error: "Invalid destination location. Coordinates missing or incorrect." });
        }

        // ✅ Find nearby captains (Fix typo: Use `pickupCoordinates.lat`, not `ltd`)
        const captainsInRadius = await mapService.getCaptainsInTheRadius(
            pickupCoordinates.lat, pickupCoordinates.lng, 2
        );
        console.log("Captains Found:", captainsInRadius);

        // ✅ Create the Ride Entry in Database
        const ride = await rideService.createRide({
            user: req.user._id, 
            pickup: {
                type: "Point",
                coordinates: [pickupCoordinates.lng, pickupCoordinates.lat]  // ✅ MongoDB requires [lng, lat]
            }, 
            destination: {
                type: "Point",
                coordinates: [destinationCoordinates.lng, destinationCoordinates.lat]  // ✅ Same fix for destination
            }, 
            vehicleType
        });

        if (!ride) {
            return res.status(500).json({ error: "Failed to create ride." });
        }

        // ✅ Notify captains
        captainsInRadius.forEach(captain => {
            sendMessageToSocketId(captain.socketId, {
                event: 'new-ride',
                data: ride
            });
        });

        return res.status(201).json(ride);

    } catch (error) {
        console.error("Ride creation error:", error.message);

        if (!res.headersSent) {  // ✅ Ensure no duplicate responses
            return res.status(500).json({ error: error.message });
        }
    }
};


exports.getFare = async (req, res) => {
  try {
    const { pickup, destination } = req.query;
    console.log('Pickup:', pickup, 'Destination:', destination);

    if (!pickup || !destination) {
      return res.status(400).json({ message: "Pickup and destination required" });
    }

    // Simulate fare calculation or call Google API here
    const fare = { amount: 100, distance: '5 km', time: '10 mins' };
    return res.json(fare);
  } catch (err) {
    console.error('Error calculating fare:', err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}


module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }
}

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })



        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    } s
}
