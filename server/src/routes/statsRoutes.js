const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/weekly', statsController.getWeeklyStats);

module.exports = router;
