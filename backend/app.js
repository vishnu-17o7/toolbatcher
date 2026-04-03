const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const toolRoutes = require('./routes/tools');
const feedbackRoutes = require('./routes/feedback');

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return String(value).toLowerCase() === 'true';
}

function getAllowedOrigins() {
  const configured = process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getTrustProxySetting() {
  const configured = process.env.TRUST_PROXY;

  if (configured === undefined || configured === '') {
    return process.env.VERCEL ? 1 : false;
  }

  if (configured === 'true') {
    return true;
  }

  if (configured === 'false') {
    return false;
  }

  const numeric = Number.parseInt(configured, 10);
  if (!Number.isNaN(numeric) && String(numeric) === configured.trim()) {
    return numeric;
  }

  return configured;
}

function getDatabaseStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
}

function createApp() {
  const app = express();
  const allowedOrigins = getAllowedOrigins();
  const trustProxy = getTrustProxySetting();
  const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '200kb';
  const publicBaseUrl = String(process.env.PUBLIC_BASE_URL || '').trim();
  const apiRateLimitWindowMs = parsePositiveInt(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
  const apiRateLimitMax = parsePositiveInt(process.env.API_RATE_LIMIT_MAX, 300);
  const installRateLimitWindowMs = parsePositiveInt(process.env.INSTALL_RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000);
  const installRateLimitMax = parsePositiveInt(process.env.INSTALL_RATE_LIMIT_MAX, 300);
  const installRateLimitDisabled = parseBoolean(process.env.DISABLE_INSTALL_RATE_LIMIT, false);

  app.locals.runtimeConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',
    trustProxy,
    allowedOrigins,
    publicBaseUrl: publicBaseUrl || null,
    jsonBodyLimit,
    rateLimits: {
      api: {
        windowMs: apiRateLimitWindowMs,
        max: apiRateLimitMax,
      },
      installSessions: {
        windowMs: installRateLimitWindowMs,
        max: installRateLimitMax,
        disabled: installRateLimitDisabled,
      },
    },
  };

  app.set('trust proxy', trustProxy);

  const corsOptions = {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  };

  const apiLimiter = rateLimit({
    windowMs: apiRateLimitWindowMs,
    max: apiRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
  });

  const installLimiter = rateLimit({
    windowMs: installRateLimitWindowMs,
    max: installRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Install API rate limit exceeded. Please retry shortly.' },
    skip: () => installRateLimitDisabled,
  });

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(express.json({ limit: jsonBodyLimit }));

  const healthHandler = (req, res) => {
    const runtime = app.locals.runtimeConfig || {};
    res.json({
      status: 'ok',
      service: 'toolbatcher-backend',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeEnv: runtime.nodeEnv,
      database: getDatabaseStatus(),
      trustProxy: app.get('trust proxy'),
      publicBaseUrl: runtime.publicBaseUrl || null,
      corsAllowedOrigins: runtime.allowedOrigins || [],
      rateLimits: runtime.rateLimits || {},
    });
  };

  app.get('/healthz', healthHandler);
  app.get('/api/health', healthHandler);

  app.use('/api', apiLimiter);
  app.use('/api/tools/install-sessions', installLimiter);

  // Serve static files (install scripts)
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api/tools', toolRoutes);
  app.use('/api/feedback', feedbackRoutes);

  app.use((err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'Origin not allowed by CORS policy' });
    }
    return next(err);
  });

  return app;
}

module.exports = createApp;