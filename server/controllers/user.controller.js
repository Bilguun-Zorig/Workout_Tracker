const User = require('../models/user.model');


module.exports.createUser = (request, response) =>{
        User.create(request.body)
        .then(user => response.json(user))
        .catch(err => response.json(err));
}
