const User = require('../models/user.model');


module.exports = {

        register: async (req, res) => {
                User.create(req.body) 
                        .then(user => { 
                                const userToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY); 
                                res.cookie("usertoken", userToken, { httpOnly: true }) .json({ msg: "success!",  user: user }); })
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

        logout: (req, res) => { res.clearCookie('usertoken'); res.sendStatus(200); }

}
