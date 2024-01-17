const mongoose = require("mongoose");
const validator = require("validator");
bcrypt = require('bcryptjs');

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
    },
    passwordConfirm: {
        required: [ true, " You must confirm Your Password"],
        type: String,
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
    }
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
}
const User = mongoose.model("User", userSchema);
module.exports = User;