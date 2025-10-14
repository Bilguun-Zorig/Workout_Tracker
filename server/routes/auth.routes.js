const express = require('express')
const router = express.Router()
const verifyJWT = require('../middleware/auth.middleware')


router.get('/me', verifyJWT, (req, res) => {
    console.log("USER FROM AUTH ROUTES", req.user)
    res.json({user: req.user})
})

module.exports = router;