const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');
const scriptStore = require('../utils/scriptStore');
const { generateDynamicScript } = require('../utils/userScriptBuilder');
const {
	buildInstallManifest,
	renderShellRunner,
	renderPowerShellRunner,
} = require('../utils/installSessionBuilder');
const { signManifest, verifyManifest } = require('../utils/manifestSigner');

const SUPPORTED_OS = new Set(['linux', 'macos', 'windows']);
const SESSION_TTL_MINUTES = parseInt(process.env.SCRIPT_TTL_MINUTES || '30', 10);
const STEP_RETRY_COUNT = Math.max(1, parseInt(process.env.INSTALL_STEP_RETRIES || '2', 10));

function runnerOneTimeEnabled() {
	return String(process.env.INSTALL_RUNNER_ONE_TIME || 'true').toLowerCase() === 'true';
}

function getClientIp(req) {
	return req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';
}

function getBaseUrl(req) {
	const configuredBaseUrl = String(process.env.PUBLIC_BASE_URL || '').trim();
	if (configuredBaseUrl) {
		return configuredBaseUrl.replace(/\/+$/, '');
	}

	const forwardedProto = req.headers['x-forwarded-proto'];
	const forwardedHost = req.headers['x-forwarded-host'];
	const protoValue = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
	const hostValue = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost;
	const proto = String(protoValue || req.protocol || 'http').split(',')[0].trim() || 'http';
	const host = String(hostValue || req.get('host') || '').split(',')[0].trim();
	return `${proto}://${host}`;
}

function strictIpEnabled() {
	return String(process.env.STRICT_INSTALL_IP || 'false').toLowerCase() === 'true';
}

function canAccessSession(req, entry) {
	if (!entry) {
		return false;
	}

	if (!strictIpEnabled()) {
		return true;
	}

	return getClientIp(req) === entry.ip;
}

async function ensureInstallSession(req, res) {
	const { token } = req.params;
	const entry = await scriptStore.get(token);

	if (!entry || !entry.data || !entry.data.manifest) {
		res.status(404).json({ error: 'Invalid or expired install session token' });
		return null;
	}

	if (!canAccessSession(req, entry)) {
		res.status(403).json({ error: 'Install session access denied' });
		return null;
	}

	return entry;
}

function ensureSignature(entry, signature) {
	const providedSignature = String(signature || '');
	if (!providedSignature || !entry?.data?.signature) {
		return false;
	}

	if (providedSignature !== entry.data.signature) {
		return false;
	}

	return verifyManifest(entry.data.manifest, providedSignature);
}

router.get('/', toolController.getAllTools);
router.post('/', toolController.createTool);
router.put('/:id', toolController.updateTool);
router.delete('/:id', toolController.deleteTool);
router.post('/generate-script', toolController.generateScript);
router.post('/update-versions', toolController.triggerUpdateVersions); // Add route for triggering update

router.get('/install-sessions/audit', async (req, res) => {
	try {
		const sessions = await scriptStore.listAudit({
			limit: req.query.limit,
			status: req.query.status,
			os: req.query.os,
		});

		res.json({
			count: sessions.length,
			sessions,
		});
	} catch (error) {
		console.error('Failed to fetch install audit logs:', error);
		res.status(500).json({ error: 'Failed to fetch install audit logs' });
	}
});

// Create install session and return platform-specific one-liner commands.
router.post('/install-sessions', async (req, res) => {
	try {
		const { selectedTools, targetOS } = req.body;

		if (!Array.isArray(selectedTools) || selectedTools.length === 0) {
			return res.status(400).json({ error: 'selectedTools must be a non-empty array' });
		}

		if (!SUPPORTED_OS.has(targetOS)) {
			return res.status(400).json({ error: 'targetOS must be one of linux, macos, or windows' });
		}

		const manifest = await buildInstallManifest(selectedTools, targetOS);
		const signature = signManifest(manifest);
		const ip = getClientIp(req);
		const token = await scriptStore.save({
			data: { manifest, signature },
			ip,
			os: targetOS,
			ttlMinutes: SESSION_TTL_MINUTES,
			oneTime: false,
		});

		const baseUrl = getBaseUrl(req);
		const shellCommand = `curl -fsSL ${baseUrl}/api/tools/install-sessions/${token}/bootstrap.sh | bash`;
		const powershellCommand = `irm ${baseUrl}/api/tools/install-sessions/${token}/bootstrap.ps1 | iex`;

		res.status(201).json({
			token,
			expiresInMinutes: SESSION_TTL_MINUTES,
			commands: {
				shell: shellCommand,
				powershell: powershellCommand,
			},
			manifest,
			signature,
		});
	} catch (error) {
		console.error('Error creating install session:', error);
		res.status(500).json({ error: error.message || 'Failed to create install session' });
	}
});

router.get('/install-sessions/:token/manifest', async (req, res) => {
	const entry = await ensureInstallSession(req, res);
	if (!entry) {
		return;
	}

	res.json({
		manifest: entry.data.manifest,
		signature: entry.data.signature,
		expiresAt: entry.expiresAt,
	});
});

router.get('/install-sessions/:token/verify-signature', async (req, res) => {
	const entry = await ensureInstallSession(req, res);
	if (!entry) {
		return;
	}

	const valid = ensureSignature(entry, req.query.signature);
	res.json({ valid });
});

router.post('/install-sessions/:token/events', async (req, res) => {
	const entry = await ensureInstallSession(req, res);
	if (!entry) {
		return;
	}

	const ok = await scriptStore.appendEvent(req.params.token, req.body || {});
	if (!ok) {
		return res.status(404).json({ error: 'Unable to append event for this session' });
	}

	res.status(202).json({ accepted: true });
});

router.get('/install-sessions/:token/bootstrap.sh', async (req, res) => {
	const entry = await ensureInstallSession(req, res);
	if (!entry) {
		return;
	}

	if (entry.os === 'windows') {
		return res.status(400).send('# This install session targets Windows. Use bootstrap.ps1 instead.');
	}

	const { token } = req.params;
	const baseUrl = getBaseUrl(req);
	const encodedSig = encodeURIComponent(entry.data.signature || '');
	const encodedNonce = encodeURIComponent(entry.runnerNonce || '');
	const runnerUrl = `${baseUrl}/api/tools/install-sessions/${token}/runner.sh?nonce=${encodedNonce}&signature=${encodedSig}`;
	const bootstrap = [
		'#!/usr/bin/env bash',
		'set -euo pipefail',
		"echo 'ToolBatcher bootstrap starting...'",
		"echo 'Fetching verified runner...'",
		`curl -fsSL "${runnerUrl}" | bash`,
	].join('\n');

	res.setHeader('Content-Type', 'text/plain');
	res.send(`${bootstrap}\n`);
});

router.get('/install-sessions/:token/bootstrap.ps1', async (req, res) => {
	const entry = await ensureInstallSession(req, res);
	if (!entry) {
		return;
	}

	if (entry.os !== 'windows') {
		return res.status(400).send('# This install session targets Linux/macOS. Use bootstrap.sh instead.');
	}

	const { token } = req.params;
	const baseUrl = getBaseUrl(req);
	const encodedSig = encodeURIComponent(entry.data.signature || '');
	const encodedNonce = encodeURIComponent(entry.runnerNonce || '');
	const runnerUrl = `${baseUrl}/api/tools/install-sessions/${token}/runner.ps1?nonce=${encodedNonce}&signature=${encodedSig}`;
	const bootstrap = [
		"$ErrorActionPreference = 'Stop'",
		"Write-Host 'ToolBatcher bootstrap starting...'",
		"Write-Host 'Fetching verified runner...'",
		`irm '${runnerUrl}' | iex`,
	].join('\n');

	res.setHeader('Content-Type', 'text/plain');
	res.send(`${bootstrap}\n`);
});

router.get('/install-sessions/:token/runner.sh', async (req, res) => {
	const entry = await ensureInstallSession(req, res);
	if (!entry) {
		return;
	}

	if (entry.os === 'windows') {
		return res.status(400).send('# This install session targets Windows. Use runner.ps1 instead.');
	}

	const { token } = req.params;
	const nonce = String(req.query.nonce || '');
	const signature = String(req.query.signature || '');

	if (!nonce) {
		return res.status(400).send('# Missing nonce for runner request.');
	}

	if (!ensureSignature(entry, signature)) {
		return res.status(403).send('# Manifest signature verification failed.');
	}

	const claimed = await scriptStore.markRunnerUsed(token, nonce, runnerOneTimeEnabled());
	if (!claimed) {
		return res.status(410).send('# Runner is already used or nonce is invalid.');
	}

	const baseUrl = getBaseUrl(req);
	const verifyUrl = `${baseUrl}/api/tools/install-sessions/${token}/verify-signature?signature=${encodeURIComponent(signature)}`;
	const eventsUrl = `${baseUrl}/api/tools/install-sessions/${token}/events`;
	const script = renderShellRunner(entry.data.manifest, {
		verifyUrl,
		eventsUrl,
		token,
		signature,
		maxRetries: STEP_RETRY_COUNT,
	});
	res.setHeader('Content-Type', 'text/plain');
	res.send(script);
});

router.get('/install-sessions/:token/runner.ps1', async (req, res) => {
	const entry = await ensureInstallSession(req, res);
	if (!entry) {
		return;
	}

	if (entry.os !== 'windows') {
		return res.status(400).send('# This install session targets Linux/macOS. Use runner.sh instead.');
	}

	const { token } = req.params;
	const nonce = String(req.query.nonce || '');
	const signature = String(req.query.signature || '');

	if (!nonce) {
		return res.status(400).send('# Missing nonce for runner request.');
	}

	if (!ensureSignature(entry, signature)) {
		return res.status(403).send('# Manifest signature verification failed.');
	}

	const claimed = await scriptStore.markRunnerUsed(token, nonce, runnerOneTimeEnabled());
	if (!claimed) {
		return res.status(410).send('# Runner is already used or nonce is invalid.');
	}

	const baseUrl = getBaseUrl(req);
	const verifyUrl = `${baseUrl}/api/tools/install-sessions/${token}/verify-signature?signature=${encodeURIComponent(signature)}`;
	const eventsUrl = `${baseUrl}/api/tools/install-sessions/${token}/events`;
	const script = renderPowerShellRunner(entry.data.manifest, {
		verifyUrl,
		eventsUrl,
		token,
		signature,
		maxRetries: STEP_RETRY_COUNT,
	});
	res.setHeader('Content-Type', 'text/plain');
	res.send(script);
});

// New: create a transient user-specific script token
router.post('/generate-user-script', async (req, res) => {
	try {
		const { selectedTools, targetOS } = req.body;
		if (!Array.isArray(selectedTools) || !targetOS) {
			return res.status(400).json({ error: 'selectedTools (array) and targetOS are required' });
		}
		const script = await generateDynamicScript(selectedTools, targetOS);
		const ip = getClientIp(req);
		const baseUrl = getBaseUrl(req);
		const token = await scriptStore.save({ script, ip, os: targetOS, oneTime: true });
		// Provide one-liner for user
		let oneLiner;
		if (targetOS === 'windows') {
			oneLiner = `powershell -NoProfile -ExecutionPolicy Bypass -Command \"iex (New-Object Net.WebClient).DownloadString('${baseUrl}/api/tools/fetch-script/${token}')\"`;
		} else {
			oneLiner = `bash -c \"$(curl -fsSL ${baseUrl}/api/tools/fetch-script/${token})\"`;
		}
		res.json({ token, oneLiner, expiresInMinutes: process.env.SCRIPT_TTL_MINUTES || 30 });
	} catch (e) {
		console.error('Error generating user script:', e);
		res.status(500).json({ error: 'Failed to generate user script' });
	}
});

// Retrieval endpoint - returns script only if IP matches; script is plain text.
router.get('/fetch-script/:token', async (req, res) => {
	const token = req.params.token;
	const entry = await scriptStore.get(token);
	if (!entry) return res.status(404).send('# Invalid or expired script token');
	if (!entry.script) return res.status(404).send('# Invalid script payload');
	if (!canAccessSession(req, entry)) {
		return res.status(403).send('# IP mismatch. Access denied.');
	}
	if (entry.oneTime) {
		await scriptStore.consume(token);
	}
	res.setHeader('Content-Type', 'text/plain');
	res.send(entry.script);
});

module.exports = router;
