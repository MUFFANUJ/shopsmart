const AppError = require('../utils/appError');

const notFoundHandler = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (error, req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const isOperational = error instanceof AppError;

  if (!isOperational && process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  res.status(statusCode).json({
    error: {
      message: isOperational ? error.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    },
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
