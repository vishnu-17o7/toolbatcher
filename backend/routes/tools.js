const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');

router.get('/', toolController.getAllTools);
router.post('/', toolController.createTool);
router.put('/:id', toolController.updateTool);
router.delete('/:id', toolController.deleteTool);
router.post('/generate-script', toolController.generateScript);
router.post('/update-versions', toolController.triggerUpdateVersions); // Add route for triggering update

module.exports = router;
