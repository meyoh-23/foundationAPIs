const User = require("../model/userModel");
const mongoose = require("mongoose");

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