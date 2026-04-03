# ToolBatcher

ToolBatcher generates cross-platform install plans for developer tools and supports one-liner bootstrap commands that execute a verified, token-scoped runner.

## Core Flow

1. User selects tools and target OS in the frontend.
2. Backend creates an install session with token + signed manifest.
3. User runs one-liner command.
4. Bootstrap fetches a nonce-protected runner.
5. Runner verifies signature, prompts for confirmation, executes steps with retries, and posts status events.

One-liner examples:

```bash
# Linux/macOS
curl -fsSL {bootstrap-url} | bash
```

```powershell
# Windows PowerShell
irm {bootstrap-url} | iex
```

## Project Structure

- frontend: React + Vite UI
- backend: Express API + MongoDB models
- todo.md: active implementation checklist

## Deployment

For full deployment instructions (localhost and Vercel), see DEPLOYMENT.md.

## Local Setup

### 1) Install dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 2) Configure backend environment

Create backend/.env with the variables below.

Required:

```env
DATABASE_URL=mongodb://localhost:27017/toolbatcher
```

Optional server config:

```env
PORT=3002
FRONTEND_ORIGIN=http://localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
PUBLIC_BASE_URL=
TRUST_PROXY=false
JSON_BODY_LIMIT=200kb
LOG_STARTUP_CONFIG=true
AUTO_SEED_TOOLS_ON_START=true
AUTO_UPDATE_VERSIONS_ON_START=true
```

Optional install session config:

```env
SCRIPT_TTL_MINUTES=30
INSTALL_SESSION_STORE=mongo
STRICT_INSTALL_IP=false
INSTALL_RUNNER_ONE_TIME=true
INSTALL_STEP_RETRIES=2
INSTALL_AUDIT_LIMIT=100
```

Optional security and provider config:

```env
INSTALL_MANIFEST_SECRET=change-me
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=300
INSTALL_RATE_LIMIT_WINDOW_MS=600000
INSTALL_RATE_LIMIT_MAX=300
DISABLE_INSTALL_RATE_LIMIT=false
VERSION_CACHE_TTL_MINUTES=60
VERSION_FETCH_RETRY_ATTEMPTS=3
VERSION_FETCH_RETRY_DELAY_MS=600
# Optional for higher GitHub API limits
# GITHUB_TOKEN=
```

### 3) Run app

```bash
npm run dev
```

## API Summary

Tool APIs:

```text
GET    /api/tools
POST   /api/tools
PUT    /api/tools/:id
DELETE /api/tools/:id
POST   /api/tools/generate-script
POST   /api/tools/update-versions
```

Install session APIs:

```text
POST /api/tools/install-sessions
GET  /api/tools/install-sessions/:token/manifest
GET  /api/tools/install-sessions/:token/verify-signature
GET  /api/tools/install-sessions/:token/bootstrap.sh
GET  /api/tools/install-sessions/:token/bootstrap.ps1
GET  /api/tools/install-sessions/:token/runner.sh
GET  /api/tools/install-sessions/:token/runner.ps1
POST /api/tools/install-sessions/:token/events
GET  /api/tools/install-sessions/audit
```

Feedback APIs:

```text
POST  /api/feedback
GET   /api/feedback
PATCH /api/feedback/:id
```

Operational endpoints:

```text
GET /healthz
GET /api/health
```

## Version Providers

Tool update checks are provider-based and API-driven.

- npm: npm registry API
- pypi: PyPI JSON API
- github: GitHub releases/tags API
- homebrew: formula API
- winget: winget-pkgs GitHub code search lookup

Manual tools are skipped by updater.

## Production Operator Notes

### Reverse proxy and headers

- Terminate TLS at reverse proxy.
- Forward host/proto so one-liner URLs are generated correctly:
  - X-Forwarded-Proto
  - X-Forwarded-Host (or Host)
- If the app sits behind multiple layers or a custom edge, set PUBLIC_BASE_URL explicitly.
- Set TRUST_PROXY=1 (or true) when deployed behind Vercel/NGINX/Cloudflare so client IP and protocol are interpreted correctly.

### Dynamic bootstrap URL behavior

- Bootstrap and runner URLs are generated from request headers at runtime, so localhost and custom domains both work automatically.
- If proxy headers are rewritten by infrastructure, PUBLIC_BASE_URL overrides request-derived host/protocol.

### Startup runtime config log

- On backend boot, a safe config snapshot is printed (no secrets) with CORS origins, trust proxy mode, rate limits, and health endpoints.
- Set LOG_STARTUP_CONFIG=false to disable this startup log.

### TLS

- Serve only over HTTPS in production.
- Do not expose bootstrap and runner endpoints over plain HTTP.

### Caching

- Do not cache runner and bootstrap responses at CDN/proxy.
- Keep version provider cache enabled through VERSION_CACHE_TTL_MINUTES.

### Security recommendations

- Set a strong INSTALL_MANIFEST_SECRET.
- Keep INSTALL_RUNNER_ONE_TIME=true.
- Keep STRICT_INSTALL_IP=false when behind NAT/proxies unless you fully control source IP consistency.
- Configure CORS_ALLOWED_ORIGINS to an explicit comma-separated allowlist.
- Keep API and install-session rate limits enabled in production.
- Use GITHUB_TOKEN to reduce GitHub API rate-limit failures.

## Testing

```bash
cd backend
npm test
```

## Startup Automation

- On backend startup, ToolBatcher now auto-seeds a relevant default tool catalog into MongoDB.
- It also auto-runs version provider fetching on startup to refresh latest versions.
- Use AUTO_SEED_TOOLS_ON_START=false to disable seeding.
- Use AUTO_UPDATE_VERSIONS_ON_START=false to disable startup version refresh.
