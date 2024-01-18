const User = require("../model/userModel");
const sendEmail = require("../utils/emails");
const crypto = require('crypto');

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
        const { email, password } = req.body;
        console.log(email, password);
        if ( !email || !password ) {
            return next( new Error("You have to provide your email and password!") );
        }
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

// activate your account
exports.activateAccount = async (req, res, next) => {
    try {
        // get user by the posted email
        const {email} = req.body;
        const activatedUser = await User.findOne({email});
        if (!activatedUser) {
            return next(new Error("Your email is not registered for activation!"));
        };
        const accountActivationToken = await activatedUser.generateAccountActivationToken();
        await activatedUser.save({ 
            validateBeforeSave: false
        })
        const activationLink = `${req.protocol}://${req.get('host')}/api/v1/users/activate-account/${accountActivationToken}`;
        const message = `use the link to activate your account. The link expires in 10 minutes. ${activationLink} `;
        try {
            sendEmail({
                email: activatedUser.email,
                subject: "Email Activation Link",
                message,
            })
        } catch (error) {
            return next(new Error("There was an error sending an activation email"));
        }
        res.status(200).json({message: "Success", activatedUser, accountActivationToken, activationLink})
    } catch (error) {
        return next(console.log(error));
    }
};

// check on this function kesho
exports.initializeAccount = async (req, res, next) => {
    try {
        const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const activatedAccount = await User.findOne({
        activationToken: hashedToken,
        activationTokenExpiresIn: { $gt: Date.now()}
    });
    if (!activatedAccount) {
        return next(new Error("Either your activation link is expired or invalid!"));
    };
    // reset user details
    activatedAccount.password = req.body.password;
    activatedAccount.passwordConfirm = req.body.passwordConfirm;

    activatedAccount.activationTokenExpiresIn = undefined;
    activatedAccount.activationToken = undefined;
    activatedAccount.isActive = true;

    activatedAccount.save();
    res.status(200).json({
        message: "Your account has been activated successfully",
        activatedAccount
    })
    // waiting for jwt Token
    } catch (error) {
        return next( new Error("We could not Activate your Account!"));
    }
}