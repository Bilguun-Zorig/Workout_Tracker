const UserController = require('../controllers/user.controller');
const express = require('express')
const router = express.Router()

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
router.put('/:id', UserController.updateUser);
// delete existing user
router.delete('/:id', UserController.deleteUser)


module.exports = router;