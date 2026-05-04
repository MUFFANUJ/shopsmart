const { spawnSync } = require('node:child_process');
const path = require('node:path');

const serverDir = path.resolve(__dirname, '..');
const schemaPath = path.resolve(serverDir, 'prisma/schema.prisma');
const defaultDatabaseUrl = `file:${path.resolve(serverDir, 'prisma/test.db')}`;
const databaseUrl = process.env.DATABASE_URL?.trim() || defaultDatabaseUrl;

const prismaBin =
  process.platform === 'win32'
    ? path.resolve(serverDir, 'node_modules/.bin/prisma.cmd')
    : path.resolve(serverDir, 'node_modules/.bin/prisma');

const result = spawnSync(
  prismaBin,
  ['db', 'push', '--schema', schemaPath, '--force-reset', '--skip-generate'],
  {
    stdio: 'inherit',
    cwd: serverDir,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      RUST_LOG: process.env.RUST_LOG || 'info',
    },
  }
);

if (result.error) {
  // eslint-disable-next-line no-console
  console.error(result.error);
  process.exit(1);
}

if (typeof result.status === 'number' && result.status !== 0) {
  process.exit(result.status);
}
