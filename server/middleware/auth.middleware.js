const jwt = require('jsonwebtoken');
const User = require('../models/user.model')

module.exports = async function verifyJWT(req, res, next) {

    try {
        const token = req.cookies?.usertoken;
        console.log("TOKEN FROM AUTH MIDDLEWARE", token)

        if(!token) return res.status(401).json({ msg: 'No token' });

        const {id} = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findById(id).select('-password');

        if(!user) return res.status(401).json({ msg: 'User not found'});

        req.user = user;
        next();

    }catch (e){
        return res.status(401).json({ msg: 'Invalid token' })
    }
    
}