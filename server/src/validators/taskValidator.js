const AppError = require('../utils/appError');

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim();
};

const validateTitle = (title) => {
  const normalizedTitle = normalizeString(title);

  if (typeof normalizedTitle !== 'string' || normalizedTitle.length === 0) {
    throw new AppError(400, 'Title is required and must be a non-empty string.');
  }

  if (normalizedTitle.length > 120) {
    throw new AppError(400, 'Title must not exceed 120 characters.');
  }

  return normalizedTitle;
};

const validateDescription = (description) => {
  if (description === undefined || description === null || description === '') {
    return null;
  }

  if (typeof description !== 'string') {
    throw new AppError(400, 'Description must be a string.');
  }

  if (description.length > 500) {
    throw new AppError(400, 'Description must not exceed 500 characters.');
  }

  return description.trim();
};

const validateCompleted = (completed) => {
  if (completed === undefined) {
    return undefined;
  }

  if (typeof completed !== 'boolean') {
    throw new AppError(400, 'Completed must be a boolean.');
  }

  return completed;
};

const validateCreatePayload = (payload) => {
  const title = validateTitle(payload.title);
  const description = validateDescription(payload.description);
  const completed = validateCompleted(payload.completed);

  return {
    title,
    description,
    ...(completed !== undefined ? { completed } : {}),
  };
};

const validateUpdatePayload = (payload) => {
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(payload, 'title')) {
    updates.title = validateTitle(payload.title);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'description')) {
    updates.description = validateDescription(payload.description);
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'completed')) {
    updates.completed = validateCompleted(payload.completed);
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, 'At least one field must be provided for update.');
  }

  return updates;
};

module.exports = {
  validateCreatePayload,
  validateUpdatePayload,
};
