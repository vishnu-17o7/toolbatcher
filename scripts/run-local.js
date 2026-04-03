const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const nodeCommand = process.execPath;

let shuttingDown = false;
const children = [];

function startProcess(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
    shell: true,
  });

  children.push({ name, child });

  child.on('error', (error) => {
    console.error(`[${name}] failed to start:`, error.message);
    shutdown(1);
  });

  child.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const readable = signal ? `signal ${signal}` : `code ${code ?? 1}`;
    console.error(`[${name}] exited unexpectedly with ${readable}`);
    shutdown(typeof code === 'number' ? code : 1);
  });
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const { child } of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  setTimeout(() => {
    for (const { child } of children) {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }
    process.exit(exitCode);
  }, 1500).unref();

  setTimeout(() => process.exit(exitCode), 50).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Starting frontend and backend for local development...');

startProcess('frontend', `${npmCommand} run dev`, [], frontendDir);
startProcess('backend', `"${nodeCommand}" ${path.join('backend', 'index.js')}`, [], rootDir);
