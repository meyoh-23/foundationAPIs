const User = require("../model/userModel");
const sendEmail = require("../utils/emails");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');

// sign authentication token
const signToken = (id) => {
    return jwt.sign(
        {id}, 
        process.env.JWT_SECRET, 
        {expiresIn: process.env.JWT_EXPIRES_IN}
    );
}

const createAndSendAuthToken = (user, statusCode, res) => {
    const authToken = signToken(user._id);
    const cookiePotions =  {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 *60 * 60 * 1000
        ),
        httpOnly: true,
        /* cookiePotions.secure = true */
    };
    res.cookie('jwt', authToken, cookiePotions);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        authToken,
        data: {
            user
        }
    })
}

// check if a person is logged in
exports.protect = async(req, res, next) => {
    let authToken;
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        authToken = req.headers.authorization.split(' ')[1];
    };
    if (!authToken) {
        return next(new Error("You are currently not loged in!"));
    }
    // verify the authToken
    const verifiedAuthToken = await promisify(jwt.verify)(authToken, process.env.JWT_SECRET);
    // check if the owner of the token still exists
    const refreshedUser = await User.findById(verifiedAuthToken.id); 
        if (!refreshedUser) {
            return next(new Error(
                'The user nolonger exists',
                )
            );
        }
        // implement this on later
    /* if (refreshedUser.changedPasswordAfter(verifiedAuthToken.iat)) {
            return next(new Error("You recently changed your password. Plsease login again!"));
        } */
        // if the user makes it up to this point, we grant access to the protected route
        req.user = refreshedUser;
    next();
}

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
        if (!loginUser.isActive) {
            return next(new Error("Your account has not been activated. Activate your account before loging in again!"));
        }
        // jwt token for login
        createAndSendAuthToken(loginUser, 200, res);
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
        // send email with activation link
        try {
            sendEmail({
                email: activatedUser.email,
                subject: "Email Activation Link",
                message,
            })
        } catch (error) {
            return next(new Error("There was an error sending an activation email"));
        }
        res.status(200).json({message: "activation link has been sent to your email", accountActivationToken, activationLink})
    } catch (error) {
        return next(console.log(error));
    }
};

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
    if (activatedAccount.isActive) {
        return next(new Error("Your Account is already activted, Login instead!"));
    }
    // reset user details
    activatedAccount.activationTokenExpiresIn = undefined;
    activatedAccount.activationToken = undefined;
    activatedAccount.isActive = true;

    await activatedAccount.save(
        {validateBeforeSave: false}
    );
    res.status(200).json({
        message: "Your account has been activated successfully, you will need to reset your password and then login",
        activatedAccount
    })
    // waiting for jwt Token
    } catch (error) {
        return next( new Error("We could not Activate your Account!"));
    }
}