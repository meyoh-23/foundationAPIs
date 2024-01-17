const User = require("../model/userModel");
const mongoose = require("mongoose");

// signup
exports.newUser = async (req, res) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            photo: req.body.photo
    });
    res.status(201).json({
        message: "User Created Successfully",
        user: newUser,
    });

    } catch (error) {
        res
        .status(500)
        .json({
            message: "failed to create a new user",
        });
        console.log(error);
    }
}

// installing jwt
exports.login = async (req, res, next) => {
    try {
        // get email and password from the user
        const { email, password } = req.body;
        console.log(email, password);
        if ( !email || !password ) {
            return next( new Error("You have to provide your email and password!") );
        }
        // search for user based on password
        const loginUser = await User.findOne({ email }).select("+password");
        if (!loginUser || !loginUser.correctPassword(password, loginUser.password)) {
            return next( new Error("Either your email or password is incorrect!") );
        }
        res
        .status(200)
        .json({message: "logged in Successfully",
        loginUser
    });
    } catch (error) {
        res.status(500).json({message: "An error occured while trying to log in!"})
    }
};

// activate your account;
exports.activateAccount = async (req, res, next) => {
    try {
        
    } catch (error) {
        
    }
};