const express = require('express');
const router = express.Router();

//after installing express-validator
const { body } = require("express-validator")

//to create or register user we are using controller
const userController = require('../controllers/user.controller');

const authMiddleware = require('../middlewares/auth.middleware');


//creating a post router
//in this route, whatever data will come, we have to verify that data in this route
//validating through express validator
//array passed here is a sequence of call back
router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({min: 3}).withMessage('First name must be at least 3 characters long'),
    body('fullname.lastname').isLength({min: 3}).withMessage('Last name should be 3 characters long'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
],
userController.registerUser
)


//login router
router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').exists().withMessage('Password is required')
],

userController.loginUser
)


//profile router
router.get('/profile', authMiddleware.authUser, userController.getUserProfile );


//logout router 
router.get('/logout', authMiddleware.authUser, userController.logoutUser)
module.exports = router;
