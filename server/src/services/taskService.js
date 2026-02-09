const prisma = require('../db/prisma');
const AppError = require('../utils/appError');

const normalizeId = (id) => {
  const parsedId = Number.parseInt(id, 10);

  if (Number.isNaN(parsedId) || parsedId < 1) {
    throw new AppError(400, 'Task id must be a positive integer.');
  }

  return parsedId;
};

const getAllTasks = async () =>
  prisma.task.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

const getTaskById = async (id) => {
  const taskId = normalizeId(id);
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new AppError(404, 'Task not found.');
  }

  return task;
};

const createTask = async (data) => prisma.task.create({ data });

const updateTask = async (id, data) => {
  const taskId = normalizeId(id);

  await getTaskById(taskId);

  return prisma.task.update({
    where: { id: taskId },
    data,
  });
};

const deleteTask = async (id) => {
  const taskId = normalizeId(id);

  await getTaskById(taskId);

  await prisma.task.delete({ where: { id: taskId } });
};

module.exports = {
  normalizeId,
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
