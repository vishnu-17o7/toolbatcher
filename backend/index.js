const connectDB = require('./config/database');
const createApp = require('./app');
const { seedDefaultTools } = require('./scripts/seed_default_tools');
const { updateVersions } = require('./scripts/update_versions');

const PORT = process.env.PORT || 3002;  // Changed port to 3002

function shouldLogStartupConfig() {
  const raw = process.env.LOG_STARTUP_CONFIG;
  if (raw === undefined || raw === null || raw === '') {
    return true;
  }
  return String(raw).toLowerCase() === 'true';
}

function getStartupConfigSnapshot(app, port) {
  const runtime = app.locals.runtimeConfig || {};
  return {
    port: Number(port),
    env: runtime.nodeEnv || process.env.NODE_ENV || 'development',
    trustProxy: app.get('trust proxy'),
    publicBaseUrl: runtime.publicBaseUrl || null,
    corsAllowedOrigins: runtime.allowedOrigins || [],
    jsonBodyLimit: runtime.jsonBodyLimit || null,
    rateLimits: runtime.rateLimits || {},
    healthEndpoints: ['/healthz', '/api/health'],
  };
}

function isEnabled(value, fallback = true) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value).toLowerCase() === 'true';
}

function shouldSeedToolsOnStart() {
  return isEnabled(process.env.AUTO_SEED_TOOLS_ON_START, true);
}

function shouldAutoUpdateVersionsOnStart() {
  return isEnabled(process.env.AUTO_UPDATE_VERSIONS_ON_START, true);
}

async function maybeSeedTools() {
  if (!shouldSeedToolsOnStart()) {
    console.log('Skipping startup tool seeding (AUTO_SEED_TOOLS_ON_START=false).');
    return;
  }

  try {
    await seedDefaultTools({ logger: console });
  } catch (error) {
    console.error('Startup tool seeding failed:', error);
  }
}

function maybeRunVersionRefresh() {
  if (!shouldAutoUpdateVersionsOnStart()) {
    console.log('Skipping startup version refresh (AUTO_UPDATE_VERSIONS_ON_START=false).');
    return;
  }

  // Run in the background so server startup is not blocked by provider API latency.
  setTimeout(() => {
    updateVersions({ manageConnection: false }).catch((error) => {
      console.error('Startup version refresh failed:', error);
    });
  }, 1000);
}

async function start() {
  await connectDB();
  await maybeSeedTools();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    if (shouldLogStartupConfig()) {
      const snapshot = getStartupConfigSnapshot(app, PORT);
      console.log('Startup runtime config:', JSON.stringify(snapshot, null, 2));
    }

    maybeRunVersionRefresh();
  });
}

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
