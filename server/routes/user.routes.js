const UserController = require('../controllers/user.controller');
const express = require('express')
const router = express.Router()

// module.exports = app => {
//     app.post('/api/user', UserController.register);
//     app.post('/api/user/login', UserController.login)
//     app.post('/api/user/logout', UserController.logout)

// }

//? new style - router-based mounting
//Register new user
router.post('/', UserController.register);
//Login 
router.post('/login', UserController.login);
//Logout
router.post('/logout', UserController.logout);

// get one user
router.get('/:id', UserController.getSingleUser);
// update existing user
router.patch('/:id', UserController.updateUser);
// delete existing user
router.delete('/:id', UserController.deleteUser)


module.exports = router;