process.env.GITHUB_PAGES = 'true';

const [, , command, ...args] = process.argv;

if (!command) {
  console.error('Usage: node scripts/run-with-pages-env.mjs <astro-command> [...args]');
  process.exit(1);
}

const { spawnSync } = await import('node:child_process');

const result = spawnSync('npx', ['astro', command, ...args], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
