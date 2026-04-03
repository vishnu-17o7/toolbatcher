const test = require('node:test');
const assert = require('node:assert/strict');

process.env.INSTALL_SESSION_STORE = 'memory';
process.env.STRICT_INSTALL_IP = 'false';
process.env.INSTALL_RUNNER_ONE_TIME = 'true';

const request = require('supertest');
const createApp = require('../app');
const ToolCommand = require('../models/ToolCommand');
const scriptStore = require('../utils/scriptStore');
const { signManifest } = require('../utils/manifestSigner');

const app = createApp();

const seededTools = [
  {
    toolName: 'git',
    versions: ['2.45.1', '2.45.0'],
    commands: {
      linux: 'sudo apt install git={version}',
      macos: 'brew install git@{version}',
      windows: 'winget install Git.Git --version {version}',
    },
  },
  {
    toolName: 'node',
    versions: ['20.19.0', '18.20.3'],
    commands: {
      linux: 'sudo apt install nodejs={version}',
      macos: 'brew install node@{version}',
      windows: 'winget install OpenJS.NodeJS --version {version}',
    },
  },
];

let originalFind;

function extractRunnerPath(bootstrapBody) {
  const match = bootstrapBody.match(/https?:\/\/[^\s"']+/);
  assert.ok(match, 'Runner URL should exist in bootstrap script');
  const parsed = new URL(match[0]);
  return `${parsed.pathname}${parsed.search}`;
}

async function createSession(targetOS = 'linux') {
  const response = await request(app)
    .post('/api/tools/install-sessions')
    .send({
      targetOS,
      selectedTools: [
        { name: 'git', version: '2.45.1' },
        { name: 'node', version: '20.19.0' },
      ],
    });

  assert.equal(response.status, 201);
  return response.body;
}

test.before(() => {
  originalFind = ToolCommand.find;
  ToolCommand.find = async (query) => {
    const names = query?.toolName?.$in || [];
    return seededTools.filter((tool) => names.includes(tool.toolName));
  };
});

test.after(() => {
  ToolCommand.find = originalFind;
});

test('creates install session and returns manifest payload', async () => {
  const session = await createSession('linux');

  assert.ok(session.token);
  assert.equal(session.manifest.targetOS, 'linux');
  assert.equal(session.manifest.steps.length, 2);
  assert.ok(session.commands.shell.includes('/bootstrap.sh'));
  assert.ok(session.signature);

  const manifestResponse = await request(app).get(`/api/tools/install-sessions/${session.token}/manifest`);
  assert.equal(manifestResponse.status, 200);
  assert.equal(manifestResponse.body.manifest.steps.length, 2);
});

test('returns error for invalid install session token', async () => {
  const response = await request(app).get('/api/tools/install-sessions/invalid-token/manifest');
  assert.equal(response.status, 404);
});

test('returns OS mismatch error for bootstrap endpoint', async () => {
  const session = await createSession('windows');
  const response = await request(app).get(`/api/tools/install-sessions/${session.token}/bootstrap.sh`);
  assert.equal(response.status, 400);
});

test('enforces one-time runner fetch with nonce replay protection', async () => {
  const session = await createSession('linux');
  const bootstrapResponse = await request(app).get(`/api/tools/install-sessions/${session.token}/bootstrap.sh`);
  assert.equal(bootstrapResponse.status, 200);

  const runnerPath = extractRunnerPath(bootstrapResponse.text);

  const firstRunner = await request(app).get(runnerPath);
  assert.equal(firstRunner.status, 200);
  assert.match(firstRunner.text, /Verifying manifest signature/);

  const secondRunner = await request(app).get(runnerPath);
  assert.equal(secondRunner.status, 410);
});

test('rejects expired session tokens', async () => {
  const manifest = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    targetOS: 'linux',
    steps: [{ toolName: 'git', version: '2.45.1', command: 'echo ok' }],
  };

  const token = await scriptStore.save({
    data: { manifest, signature: signManifest(manifest) },
    os: 'linux',
    ttlMinutes: -1,
  });

  const response = await request(app).get(`/api/tools/install-sessions/${token}/manifest`);
  assert.equal(response.status, 404);
});
