const { spawnSync } = require('node:child_process');
const path = require('node:path');

const serverDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(serverDir, '..');
const schemaPath = path.resolve(serverDir, '../prisma/schema.prisma');
const defaultDatabaseUrl = `file:${path.resolve(repoRoot, 'prisma/dev.db')}`;
const databaseUrl = process.env.DATABASE_URL?.trim() || defaultDatabaseUrl;

const prismaBin =
  process.platform === 'win32'
    ? path.resolve(serverDir, 'node_modules/.bin/prisma.cmd')
    : path.resolve(serverDir, 'node_modules/.bin/prisma');

const run = (cmd, args) => {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    cwd: repoRoot,
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
      RUST_LOG: process.env.RUST_LOG || 'info',
    },
  });

  if (result.error) {
    // eslint-disable-next-line no-console
    console.error(result.error);
    process.exit(1);
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }
};

run(prismaBin, ['db', 'push', '--schema', schemaPath, '--force-reset', '--skip-generate']);
run(prismaBin, ['generate', '--schema', schemaPath]);
run(process.execPath, [path.resolve(serverDir, '../prisma/seed.js')]);
