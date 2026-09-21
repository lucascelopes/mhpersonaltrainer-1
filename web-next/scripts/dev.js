const { spawn } = require('child_process');
const path = require('path');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, ['--max-old-space-size=3072', nextBin, 'dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_TLS_REJECT_UNAUTHORIZED: '0',
  },
});

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
