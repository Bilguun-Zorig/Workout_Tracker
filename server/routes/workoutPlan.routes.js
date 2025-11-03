// const express = require('express')
// const router = express.Router()
// const workoutPlanController = require('../controllers/workoutPlan.controller')
// const verifyJWT = require('../middleware/auth.middleware')

// router.use(verifyJWT)

// //Create workout plan
// router.post('/new-plan', workoutPlanController.create);


// module.exports = router;

const express = require('express');
const verifyJWT = require('../middleware/auth.middleware');
const ctrl = require('../controllers/workoutPlan.controller');

const router = express.Router();
router.use(verifyJWT);

router.post('/new-plan', ctrl.create);
router.get('/by-date', ctrl.getByDate);
router.get('/all-sessions', ctrl.getAllSession)


module.exports = router;
