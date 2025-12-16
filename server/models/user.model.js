const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const {isEmail} = require('validator') 

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        minlength: [2, 'First name must be at least 2 characters long']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        minlength: [2, 'Last name must be at least 2 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email already exists'], // unique is not VALIDATOR!!!
        validate: [isEmail, "Please enter a valid email"],
        immutable: true // prevent Mongoose updates 
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    //! Later, I can gate features based on role
    roles: {
        type: [String],
        default: ['user']
    },
    lastDeloadShownAt: {
        type: Date,
        default: null
    },
    gender: {
        type: String,
        enum: {
            values: ['male', 'female', 'other', 'prefer_not_to_say'],
            message: 'Gender must be male, female, other or prefer_not_to_say'
        },
        default: 'prefer_not_to_say'
    },
    age: {
        type: Number,
    },
    height: {
        type: Number
    },
    weight: {
        type: Number
    }
}, {timestamps: true});

UserSchema.virtual('confirmPassword')
    .get(function () { return this._confirmPassword })
    .set(function (value) {this._confirmPassword = value});

UserSchema.pre('validate', function(next){
    if(this.password !== this.confirmPassword){
        this.invalidate('confirmPassword', 'Password must match confirm password');
    }
    next();
})

UserSchema.pre('save', function(next) {

    // Only hash when password is newly set or modified
    if (!this.isModified('password')) {
        return next();
    }

    bcrypt.hash(this.password, 10)
        .then(hash => {
            this.password = hash;
            next();
        })
        .catch(next);
});


module.exports = mongoose.model('User', UserSchema);