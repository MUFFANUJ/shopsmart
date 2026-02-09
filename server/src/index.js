const app = require('./app');
const environment = require('./config/env');

app.listen(environment.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${environment.port}`);
});
