//making a logout route
//creating a blacklist token model where user's logout token will be stored
//then will check particular token is in blacklist or not
//if we blacklist all logout tokens then our database will be full of tokens so for that we will use ttl
//ttl = time to live
//ttl works on time, if we set ttl to 1 day then after 1 day token will be deleted

const mongoose = require('mongoose');


const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours in seconds (24 * 60 * 60)
    }

    //after 24 hours token will be deleted
});

// Create model from schema
const BlacklistToken = mongoose.model('BlacklistToken', blacklistTokenSchema);

module.exports = BlacklistToken;