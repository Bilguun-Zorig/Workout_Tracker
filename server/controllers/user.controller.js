const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//Cookie options control "how the browser stores and sends cookies". This and CORS works together

const cookieOptions = {
        httpOnly: true,
        sameSite: 'Lax', //works for localhost:5173 <--> localhost:8000
        // secure: false //enable this only in production HTTPS
}

//! Use it when to deploy 
// const cookieOptions = {
//   httpOnly: true,
//   sameSite: 'None', // needed for cross-domain cookies
//   secure: true,     // only send cookies over HTTPS
// };


module.exports = {

        register: async (req, res) => {

                try {
                        const user = await User.create(req.body);
                        const userToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY); 
                        return res
                                .cookie("usertoken", userToken, cookieOptions)
                                .status(201)
                                .json({ msg: "This response has a cookie!",  user: user });

                } catch (err) {
                        //duplicate email
                        if(err.code === 11000){
                                return res.status(400).json({ errors: {email: {message: "Email already exists"}}});
                                }
                        return res.status(400).json( {errors: err.errors || err} ); 
                }
        },

        login: async(req, res) => {

                try {
                        const user = await User.findOne({ email: req.body.email });
                        
                        if(!user) {
                                return res.status(400).json({ msg: 'Invalid email or password'} );
                        }

                        const correctPassword = await bcrypt.compare(req.body.password, user.password);

                        if(!correctPassword) {
                                return res.status(400).json({ msg: 'Invalid email or password'});
                        }

                        const userToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

                        return res.cookie("usertoken", userToken, cookieOptions)
                        .json({msg: 'Success!'})
                } catch (err){
                        console.log("Login ERROR <>", err);
                        return res.status(500).json({msg: 'Server error'});
                }
        },

        logout: (req, res) => { 
                res.clearCookie('usertoken'); 
                return res.sendStatus(200); 
        },

        //? Get One User
        getSingleUser: async (req, res) => {

                try {
                        const user = await User.findById(req.params.id).select('-password');
                        console.log("USER FROM USER CONTROLLER", user)
                        if(!user) return res.status(404).json({message: 'User not found'});
                        return res.json({user})
                }catch(err){
                        return res.status(500).json({message: 'Something went wrong', error: err});
                }
        },

        //? Update existing user
        updateUser: async (req, res) => {
                try {   
                        const updates = {...req.body}
                        // console.log("UPDATES FROM USER CONTROLLER <>", updates.email)
                        // not allow to update email
                        delete updates.email;
                        if(updates.password){
                                updates.password = await bcrypt.hash(updates.password, 10);
                        }

                        const user = await User.findOneAndUpdate(
                                {_id: req.params.id}, 
                                {$set: updates}, 
                                {new: true, runValidators: true, context: 'query'})
                                .select('-password');
                        // console.log("USER FROM USER CONTROLLER <>", user)
                        if(!user) {
                                return res.status(404).json({message: 'User not found'});
                        }
                        return res.json({user})
                } catch (err) {

                        //duplicate email
                        if(err.code === 11000){
                                return res.status(400)
                                .json({ errors: {email: {message: "Email already exists"}}});
                        }
                        return res.status(400).json({message: 'Validation failed', error: err.errors || err});
                }
        },

        deleteUser: async (req, res) => {
                try {
                        const user = await User.deleteOne({_id: req.params.id});
                        if(user.deletedCount === 0){
                                return res.status(404).json({message: 'User not found'});
                        }
                        // res.clearCookie('usertoken'); 
                        return res.clearCookie('usertoken', {
                                httpOnly: true,
                                sameSite: 'Lax', // 'None' in production
                                secure: process.env.NODE_ENV === 'production'
                        }).json({result: user})
                } catch (err) {
                        return res.status(400).json({message: 'Failed', error: err.errors || err});
                }
        }

}
