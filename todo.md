# ToolBatcher Installer Rework Todo

## Product Direction

- [x] Move from file downloads to one-liner bootstrap commands.
- [x] Keep generated install logic server-side and fetch by short-lived token.
- [x] Add a polished cross-platform TUI UX for install progress, retries, and logs.

## Backend: Install Sessions

- [x] Add install session API that returns token + one-liner command.
- [x] Add bootstrap endpoints for shell and PowerShell.
- [x] Add runner endpoints that execute session-specific commands with interactive prompts.
- [x] Add manifest payload generation for selected tool/version commands.
- [x] Add basic manifest signing to support integrity checks.
- [x] Replace in-memory token store with Redis or database-backed TTL store.
- [x] Add install session status/event ingestion endpoint.

## Backend: Version Fetching (API Migration)

- [x] Replace website scraping strategy with provider-based registry APIs only.
- [x] Add npm registry provider using [NPM API](https://registry.npmjs.org/{package}) (use dist-tags.latest).
- [x] Add PyPI provider using [PyPI JSON API](https://pypi.org/pypi/{package}/json) (use info.version).
- [x] Add GitHub Releases provider using [GitHub Releases API](https://api.github.com/repos/{owner}/{repo}/releases/latest) (use tag_name).
- [x] Add Homebrew formula provider using [Homebrew Formula API](https://formulae.brew.sh/api/formula/{name}.json) (use versions.stable).
- [x] Add Winget provider via winget-pkgs metadata API/GitHub lookup (latest available manifest version).
- [x] Add provider selection by sourceType and sourceIdentifier with explicit validation per registry.
- [x] Add per-provider cache and retry policy to avoid rate limits and transient failures.

## Security Hardening

- [x] Remove hardcoded localhost links from generated one-liners.
- [x] Make strict IP binding optional via configuration.
- [x] Enforce signed manifest verification in client runners.
- [x] Add nonce-based replay protection and one-time runner fetch mode.
- [x] Add admin-facing install audit logs.

## Frontend Changes

- [x] Add "Generate One-Liner Installer" flow in Tool Selector.
- [x] Show platform-specific one-liner commands and copy buttons.
- [x] Add a "Review Install Plan" panel backed by manifest API.

## Frontend Audit Remediation

- [x] Replace hardcoded frontend API URLs with centralized env-aware API client.
- [x] Restore keyboard-visible focus styles and remove global outline suppression anti-patterns.
- [x] Add semantic controls and ARIA labels for interactive elements (menu toggle, selectable cards, CTA).
- [x] Add live-region semantics for async loading, success, and error states.
- [x] Remove hover-only gated actions to ensure keyboard/touch accessibility.
- [x] Add reduced-motion-aware behavior for scrolling and UI animations.
- [x] Split routes with lazy loading + Suspense for non-home pages.
- [x] Replace heavy code highlighter/editor path with lightweight code rendering.
- [x] Prune unused editor dependencies and remove dead duplicate frontend files.
- [x] Trim unused asset imports from barrel exports to avoid shipping large unused images.

## Documentation

- [x] Update README with new install-session workflow.
- [x] Add backend environment variable docs for installer secrets and policies.
- [x] Add operator docs for production deployment (proxy headers, TLS, cache headers).

## Testing

- [x] Add route tests for install sessions and bootstrap endpoints.
- [x] Add runner rendering unit tests for shell and PowerShell scripts.
- [x] Add negative tests for invalid tokens, expired sessions, and OS mismatch.

## Current Sprint Focus

- [x] Scaffold install sessions + bootstrap + runner routes.
- [x] Wire frontend to use install-session one-liner output.
- [x] Add basic tests for the new backend flow.
