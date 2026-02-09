const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.post('/', asyncHandler(taskController.createTask));
router.get('/', asyncHandler(taskController.getTasks));
router.get('/:id', asyncHandler(taskController.getTask));
router.put('/:id', asyncHandler(taskController.updateTask));
router.delete('/:id', asyncHandler(taskController.deleteTask));

module.exports = router;
