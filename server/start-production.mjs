// LeadHub Production Starter (ES Modules)
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🚀 Starting LeadHub Production Server...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '80';

console.log(`🌐 Starting on port ${process.env.PORT}`);

// Try different startup methods in order of preference
const startupMethods = [
  // Method 1: Try built production file
  {
    name: 'Built Production Server',
    check: () => existsSync(join(rootDir, 'dist/server/production.mjs')),
    command: 'node',
    args: ['dist/server/production.mjs']
  },
  // Method 2: Use tsx with TypeScript file
  {
    name: 'TypeScript Production Server',
    check: () => existsSync(join(rootDir, 'server/production.ts')),
    command: 'npx',
    args: ['tsx', 'server/production.ts']
  },
  // Method 3: Fallback to development server
  {
    name: 'Development Server Fallback',
    check: () => existsSync(join(rootDir, 'server/index.ts')),
    command: 'npx',
    args: ['tsx', 'server/index.ts']
  }
];

let selectedMethod = null;

for (const method of startupMethods) {
  if (method.check()) {
    selectedMethod = method;
    console.log(`✅ Using: ${method.name}`);
    break;
  } else {
    console.log(`❌ Not available: ${method.name}`);
  }
}

if (!selectedMethod) {
  console.error('❌ No valid startup method found!');
  console.log('Available files in server directory:');
  try {
    import('fs').then(fs => {
      console.log(fs.readdirSync(join(rootDir, 'server')));
    });
  } catch (err) {
    console.log('Could not read server directory');
  }
  process.exit(1);
}

// Start the server
const child = spawn(selectedMethod.command, selectedMethod.args, {
  stdio: 'inherit',
  env: process.env,
  cwd: rootDir
});

child.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  child.kill('SIGINT');
});
