const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: [ true, "You must Provide Your name"],
    },
    email: {
        required: [true, " You must provide your email"],
        unique: true,
        type: String,
        validate: [validator.isEmail, "Please Provide a valid email"]
    },
    photo: String,
    password: {
        required: [true, " You need to provide your password"],
        type: String,
        default: "12345678"
    },
    passwordConfirm: {
        required: [ true, " You must confirm Your Password"],
        type: String,
        default: "12345678",
        validate: {
            validator: function(ell) {
                return ell === this.password;
            },
        message: "Passwords are not matching!"
        }
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    activationToken: String,
    activationTokenExpiresIn: Date,
    passwordChangedAt: Date,
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")){
        return next();
    };
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    return next();
})

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(
        candidatePassword,
        userPassword
        )
};

userSchema.methods.generateAccountActivationToken = async function () {
    const accountActiviationToken = crypto.randomBytes(32).toString('hex');
    this.activationToken = crypto
    .createHash('sha256')
    .update(accountActiviationToken)
    .digest("hex");
    this.activationTokenExpiresIn = Date.now() + 10 * 60 * 1000;
    return accountActiviationToken;
};

userSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp; // return false by default
    }
    return false;
}

const User = mongoose.model("User", userSchema);
module.exports = User;