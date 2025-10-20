const express = require('express')
const router = express.Router()
const workoutPlanController = require('../controllers/workoutPlan.controller')
const verifyJWT = require('../middleware/auth.middleware')

router.use(verifyJWT)

//Create workout plan
router.post('/new-plan', workoutPlanController.create);


module.exports = router;