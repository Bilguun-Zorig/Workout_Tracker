const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

module.exports = {

        register: async (req, res) => {
                User.create(req.body) 
                        .then(user => { 
                                const userToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY); 
                                res.cookie("usertoken", userToken, { httpOnly: true }) .json({ msg: "This response has a cookie!",  user: user }); 
                                console.log("USER TOKEN", userToken)
                        })
                                
                        .catch(err => res.json(err));
        },

        login: async(req, res) => {
                const user = await User.findOne({ email: req.body.email });
                if(user === null) { res.sendStatus(400); }
                const correctPassword = await bcrypt.compare(req.body.password, user.password);
                if(!correctPassword) { res.sendStatus(400); }
                const userToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
                res.cookie("usertoken", userToken, { httpOnly: true }) .json({ msg: "success!" });
        },

        logout: async (req, res) => { res.clearCookie('usertoken'); res.sendStatus(200); }

}
