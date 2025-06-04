const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//creating schema for the captain/ captain model

const captainSchema = new mongoose.Schema({

    fullname: {
        firstname: {
            type: String,
            required: true,
            minlength: [3, 'First name must be atleast 3 characters long'],
        },       

        lastname: {
            type: String,
            required: true,
            minlength: [3, 'Last name must be atleast 3 characters long'],

        }
    },

    email: {
        type: String,
        required: true,
        unique: true,
         lowercase: true,
        match: [ /^\S+@\S+\.\S+$/, 'Please enter a valid email' ]
    },

    password: {
        type: String,
        required: true,
        minlength: [5, 'password must be atleast 5 or more characters long'],
        //if the webapp find the user, then by default this password section will not pass manually
        select: false,
    },

    socketId: {
        type: String,
     },
 
     //available to take rides or not
     //if captain is available then he can take rides otherwise ride request will be rejected
     status : {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'unavailable',
     },

     vehicle: {
        color: {
            type: String,
            required: true,
            minlength: [3, 'Color must be atleast 3 characters long'],
        },

        plate: {
            type: String,
            required: true,
            minlength: [3, 'Plate must be atleast 3 characters long'],
        },

        //capacity of vehicle
        capacity : {
            type: Number,
            required: true,
            min: [1, 'Capacity must be atleast 1'],
        },

    

        //type of vehicle
        vehicleType: {
            type: String,
            required: true,
            enum: ['bike', 'car', 'auto'],
        }

    },
         
        location: {
            latitude: {
                type: Number,
                
            },

            //required is not given when driver will stay inactive we will not get the longitude and latitude

            longitude: {
                type: Number,
        }
    }

})

captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return token;
}


captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


captainSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
}

const captainModel = mongoose.model('captain', captainSchema)


module.exports = captainModel;