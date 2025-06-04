const userModel = require('../models/user-model');
const blacklistTokenModel = require('../models/blacklistToken.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const captainModel = require('../models/captain.model');

//to make sure that user is authenticated or not
//creating a middleware
module.exports.authUser = async (req, res, next) => {
    //we can get token from header and cookies

    //checking if token is in header
    //authorization will split into two parts, first part will be bearer and second part will be token
    //
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];
//checking if token is in cookies then take it from cookies but if token is in header then take it from header
    //token decrypt 
    if (!token) {
        return res.status(401).json({message : 'Unauthorized'});
    }

    //checking token is blacklisted or not
    const isBlacklisted = await blacklistTokenModel.findOne({ token : token});
    if (isBlacklisted) {
        return res.status(401).json({message : 'Unauthorized'});
    }

    //if token is there then we will decrypt the token
    //we will decode then and this part goes in try and catch block
    try {
        //we decode that items when we created our token

        const decoded = jwt.verify (token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        req.user = user;

        return next();

    
    }
    catch (err) {
        return res.status(401).json({message : 'invalid token'});
    }
}

module.exports.authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];


    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token: token });



    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id)
        req.captain = captain;

        return next()
    } catch (err) {
        console.log(err);

        res.status(401).json({ message: 'Unauthorized' });
    }
}
