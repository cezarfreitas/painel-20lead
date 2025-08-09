// Alternative production start script
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting LeadHub Production Server...');

// Try different possible file locations
const possibleFiles = [
  'dist/server/production.mjs',
  'dist/server/node-build.mjs', 
  'server/production.ts',
  'server/node-build.ts'
];

let foundFile = null;

for (const file of possibleFiles) {
  try {
    require('fs').accessSync(file);
    foundFile = file;
    console.log(`✅ Found server file: ${file}`);
    break;
  } catch (err) {
    console.log(`❌ File not found: ${file}`);
  }
}

if (!foundFile) {
  console.error('❌ No server file found! Available files:');
  try {
    const fs = require('fs');
    console.log('Contents of dist/server:', fs.readdirSync('dist/server/'));
  } catch (err) {
    console.log('dist/server directory not found');
  }
  process.exit(1);
}

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '80';

console.log(`🌐 Starting on port ${process.env.PORT}`);

// Start the server
const nodeArgs = foundFile.endsWith('.ts') ? 
  ['--loader', 'ts-node/esm', foundFile] : 
  [foundFile];

const child = spawn('node', nodeArgs, {
  stdio: 'inherit',
  env: process.env
});

child.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
  process.exit(code);
});
