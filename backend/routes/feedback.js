const express = require('express');
const router = express.Router();
const { submitFeedback, getAllFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');

router.post('/', submitFeedback);
router.get('/', getAllFeedback);
router.patch('/:id', updateFeedbackStatus);

module.exports = router;