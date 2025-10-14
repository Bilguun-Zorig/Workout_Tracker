const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//Cookie options control "how the browser stores and sends cookies". This and CORS works together

const cookieOptions = {
        httpOnly: true,
        sameSite: 'Lax', //works for localhost:5173 <--> localhost:8000
        // secure: true //enable this only in production HTTPS
}

//! Use it when to deploy 
// const cookieOptions = {
//   httpOnly: true,
//   sameSite: 'None', // needed for cross-domain cookies
//   secure: true,     // only send cookies over HTTPS
// };


module.exports = {

        register: async (req, res) => {
                User.create(req.body) 
                        .then(user => { 
                                const userToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY); 
                                res.cookie("usertoken", userToken, cookieOptions)
                                .json({ msg: "This response has a cookie!",  user: user }); 
                                console.log("USER TOKEN", userToken)
                        })
                                
                        .catch(err => {
                                if(err.code === 11000){
                                        //duplicate email
                                        return res.status(400).json({ errors: {email: {message: "Email already exists"}}});
                                }
                                // on validation
                                return res.status(400).json( {errors: err.errors || err} ); 
                        });
        },

        login: async(req, res) => {
                const user = await User.findOne({ email: req.body.email });
                if(user === null) { res.sendStatus(400); }
                const correctPassword = await bcrypt.compare(req.body.password, user.password);
                if(!correctPassword) { res.sendStatus(400); }
                const userToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
                res.cookie("usertoken", userToken, cookieOptions)
                .json({ msg: "success!" });
        },

        logout: async (req, res) => { res.clearCookie('usertoken'); res.sendStatus(200); }

}
