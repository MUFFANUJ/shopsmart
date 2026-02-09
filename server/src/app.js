const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const environment = require('./config/env');
const taskRoutes = require('./routes/taskRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: environment.corsOrigin,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (environment.nodeEnv !== 'test') {
  app.use(morgan(environment.nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ShopSmart API is healthy',
    timestamp: new Date().toISOString(),
  });
});

app.use('/tasks', taskRoutes);
app.use('/api/tasks', taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
