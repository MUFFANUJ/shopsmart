const taskService = require('../services/taskService');
const { validateCreatePayload, validateUpdatePayload } = require('../validators/taskValidator');

const createTask = async (req, res) => {
  const payload = validateCreatePayload(req.body);
  const task = await taskService.createTask(payload);

  res.status(201).json(task);
};

const getTasks = async (req, res) => {
  const tasks = await taskService.getAllTasks();
  res.status(200).json(tasks);
};

const getTask = async (req, res) => {
  const task = await taskService.getTaskById(req.params.id);
  res.status(200).json(task);
};

const updateTask = async (req, res) => {
  const payload = validateUpdatePayload(req.body);
  const task = await taskService.updateTask(req.params.id, payload);

  res.status(200).json(task);
};

const deleteTask = async (req, res) => {
  await taskService.deleteTask(req.params.id);
  res.status(204).send();
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};
