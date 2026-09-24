const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { mealSchema } = require('../validators/mealValidators');

// All meal endpoints require authentication
router.use(authenticate);

router.get('/', mealController.getMeals);
router.post('/', validate(mealSchema), mealController.createMeal);
router.get('/:id', mealController.getMealById);
router.put('/:id', validate(mealSchema), mealController.updateMeal);
router.delete('/:id', mealController.deleteMeal);

module.exports = router;
