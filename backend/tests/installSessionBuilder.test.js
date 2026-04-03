const test = require('node:test');
const assert = require('node:assert/strict');
const { renderShellRunner, renderPowerShellRunner } = require('../utils/installSessionBuilder');

const manifest = {
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  targetOS: 'linux',
  steps: [
    {
      toolName: 'git',
      version: '2.45.1',
      command: 'echo installing git',
      fallbackCommand: 'echo installing git latest',
    },
    {
      toolName: 'node',
      version: '20.19.0',
      command: 'echo installing node',
    },
  ],
};

test('renderShellRunner includes verification, retries and event hooks', () => {
  const script = renderShellRunner(manifest, {
    verifyUrl: 'https://example.com/verify',
    eventsUrl: 'https://example.com/events',
    token: 'token-123',
    maxRetries: 3,
  });

  assert.match(script, /VERIFY_URL=/);
  assert.match(script, /MAX_RETRIES=3/);
  assert.match(script, /Verifying manifest signature/);
  assert.match(script, /emit_event/);
  assert.match(script, /step_retry/);
  assert.match(script, /Installation complete\./);
});

test('renderPowerShellRunner includes verification, retries and event hooks', () => {
  const script = renderPowerShellRunner(manifest, {
    verifyUrl: 'https://example.com/verify',
    eventsUrl: 'https://example.com/events',
    token: 'token-456',
    maxRetries: 4,
  });

  assert.match(script, /\$VerifyUrl/);
  assert.match(script, /\$MaxRetries = 4/);
  assert.match(script, /\$utf8NoBom/);
  assert.match(script, /Pinned version unavailable\. Trying latest available package/);
  assert.match(script, /Verifying manifest signature/);
  assert.match(script, /Emit-Event/);
  assert.match(script, /step_retry/);
  assert.match(script, /Installation complete\./);
});
