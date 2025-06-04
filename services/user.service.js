const userModel = require('../models/user-model');

//this function only job is to create an user account
module.exports.createUser = async ({
    //the 4 things will be accepted as an object
    firstname, lastname, email, password
}) => {
    //checks
    if(!firstname || !lastname || !email || !password)
    {
      throw new Error('All fields are required');  
    } 
    //if fields are given properly then will create user account
    const user = userModel.create({
        fullname: {
            firstname,
            lastname
        },

        email,
        password
    })

    return user;
}


