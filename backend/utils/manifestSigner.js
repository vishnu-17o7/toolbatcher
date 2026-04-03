const crypto = require('crypto');

const DEFAULT_DEV_SECRET = 'toolbatcher-dev-secret-change-me';

function getManifestSecret() {
  return process.env.INSTALL_MANIFEST_SECRET || DEFAULT_DEV_SECRET;
}

function signManifest(manifest) {
  return crypto
    .createHmac('sha256', getManifestSecret())
    .update(JSON.stringify(manifest))
    .digest('hex');
}

function verifyManifest(manifest, signature) {
  const expected = signManifest(manifest);
  const actual = String(signature || '');

  if (expected.length !== actual.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(actual, 'utf8'));
}

module.exports = {
  signManifest,
  verifyManifest,
};