const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { routineSchema } = require('../validators/routineValidators');

// All routine endpoints require authentication
router.use(authenticate);

router.get('/', routineController.getRoutines);
router.post('/', validate(routineSchema), routineController.createRoutine);
router.get('/:id', routineController.getRoutineById);
router.put('/:id', validate(routineSchema), routineController.updateRoutine);
router.delete('/:id', routineController.deleteRoutine);

module.exports = router;
