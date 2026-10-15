const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const binaryPath = path.join(
  process.env.HOME,
  '.cache/mongodb-binaries/mongod-x64-zorin-6.0.14'
);

const dataDir = path.join(__dirname, '../data/db');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log(`[Local MongoDB] Launching mongod on port 27017 with data at ${dataDir}...`);

const mongod = spawn(binaryPath, ['--dbpath', dataDir, '--port', '27017', '--bind_ip', '127.0.0.1'], {
  stdio: 'inherit',
});

mongod.on('error', (err) => {
  console.error('[Local MongoDB] Failed to start:', err.message);
});

mongod.on('close', (code) => {
  console.log(`[Local MongoDB] Process exited with code ${code}`);
});

process.on('SIGINT', () => {
  mongod.kill('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  mongod.kill('SIGTERM');
  process.exit();
});
