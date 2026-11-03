const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

console.log('======================================================');
console.log('🚀 STARTING ASKMM FULL-STACK PORTAL');
console.log('📡 Backend:  http://localhost:3000');
console.log('💻 Frontend: http://localhost:5173');
console.log('======================================================\n');

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(root, 'backend'),
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(root, 'frontend'),
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  console.log('\n🛑 Shutting down backend and frontend services...');
  backend.kill();
  frontend.kill();
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

