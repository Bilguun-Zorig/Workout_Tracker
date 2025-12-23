const express = require('express');
const verifyJWT = require('../middleware/auth.middleware');
const ctrl = require('../controllers/challenge.controller');

const router = express.Router();
router.use(verifyJWT);

router.post('/', ctrl.create)
router.get('/active-challenges', ctrl.getChallenge)
router.patch('/:id/log', ctrl.logProgress)
router.patch('/:id/complete', ctrl.markComplete)
router.patch('/:id/celebration-shown', ctrl.markCelebrationShown)

module.exports = router;
