const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validate');
const { entrySchema } = require('../validators/entryValidators');

// All entry endpoints require authentication
router.use(authenticate);

router.get('/', entryController.getEntries);
router.post('/', validate(entrySchema), entryController.upsertEntry);
router.get('/:date', entryController.getEntryByDate);
router.put('/:id', validate(entrySchema), entryController.updateEntryById);
router.delete('/:id', entryController.deleteEntry);

module.exports = router;
