const UserController = require('../controllers/user.controller');
const express = require('express')
const router = express.Router()

// module.exports = app => {
//     app.post('/api/user', UserController.register);
//     app.post('/api/user/login', UserController.login)
//     app.post('/api/user/logout', UserController.logout)

// }

//? new style - router-based mounting
router.post('/', UserController.register)
router.post('/login', UserController.login)
router.post('/logout', UserController.logout)

module.exports = router;