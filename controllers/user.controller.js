const userModel = require('../models/user-model');
const userService = require('../services/user.service');
const {validationResult} = require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');


//creating a logic to create user account

module.exports.registerUser = async(req, res, next) => {
    //creating an user account needs mongoDB
    //created route to validate the data in user.router.js is incomplete because there our express validator check the router
    //if anything is wrong, and want to action then we take action on userController.registerUser
    const errors = validationResult(req);
    if (!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
    }
    const {fullname, email, password} = req.body;
    //we do not save password as simple text, we save password in hash
    const hashedPassword = await userModel.hashPassword(password);

    //creating user
const user =  await userService.createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
 
     email,
     password: hashedPassword
 });
 
    
//after creating account, need to generate an user token
const token = user.generateAuthToken();
//as a response we are sending new token with our new user to server
res.status(201).json({token, user});

}

//creating a logic to login user
 module.exports.loginUser = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
    }
    const {email, password} = req.body;
    //checking if user is registered or not
     //we cannot use findOne because we are comparing password and findone is used to find the user and we have used select false in password so password will not come by default
    const user = await userModel.findOne({email}).select('+password');


    if(!user){
        return res.status(401).json({message: 'Invalid email or password'});
    }
    //if user is registered then we will compare the password
    //we cannot use findOne because we are comparing password and findone is used to find the user and we have used select false in password so password will not come by default
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
        return res.status(401).json({msg: 'Invalid password'});
    }
    //if user is registered and password is correct then we will generate token
    const token = user.generateAuthToken();

    //cookie setting during login
    res.cookie('token', token);
    res.status(200).json({token, user});
}    

//creating a logic to get user profile
module.exports.getUserProfile = async(req, res, next) => {
    //we can get user profile from req.user that'as why res.status can respond with req.user
    //whatever response we set on middleware , we will get response like that on our profile
    res.status(200).json(req.user);
}

//creating a logic to logout user
module.exports.logoutUser = async(req, res, next) => {
   //clearing cookies
   res.clearCookie('token'); 

   //clearing token too 

   const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];
   await blacklistTokenModel.create({token});

   res.status(200).json({message: 'Logged out successfully'});
}