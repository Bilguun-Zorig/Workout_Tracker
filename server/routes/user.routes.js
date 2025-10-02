const UserController = require('../controllers/user.controller');

module.exports = app => {
    app.post('/api/user', UserController.register);
    app.post('/api/user/login', UserController.login)
    app.post('/api/user/logout', UserController.logout)

}