const express = require('express');
const verifyJWT = require('../middleware/auth.middleware');
const ctrl = require('../controllers/workoutPlan.controller');

const router = express.Router();
router.use(verifyJWT);

router.post('/new-plan', ctrl.create);
router.get('/by-date', ctrl.getByDate);
// router.get('/all-sessions', ctrl.getAllSession)
router.get('/sessions-by-weekly', ctrl.getSessionsByWeekly);
router.patch('/session/exercise-comment', ctrl.addComment)
router.get('/sessions/history', ctrl.getExerciseHistoryByWeekDay)
router.get('/session/deload-check', ctrl.checkDeload)
router.get('/session/progress', ctrl.getExerciseProgress)

module.exports = router;
