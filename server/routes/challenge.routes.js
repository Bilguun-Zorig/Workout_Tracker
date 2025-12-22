const express = require('express');
const verifyJWT = require('../middleware/auth.middleware');
const ctrl = require('../controllers/challenge.controller');

const router = express.Router();
router.use(verifyJWT);

router.post('/', ctrl.create)
router.get('/active-challenges', ctrl.getChallenge)

module.exports = router;
