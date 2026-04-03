const mongoose = require('mongoose');
const axios = require('axios');
const semver = require('semver');
const fs = require('fs').promises;
const path = require('path');
const connectDB = require('../config/database');
const ToolCommand = require('../models/ToolCommand');

const LOG_FILE = path.join(__dirname, 'update_versions.log');
const CACHE_FILE = path.join(__dirname, 'version_cache.json');
const CACHE_TTL_MINUTES = Math.max(1, parseInt(process.env.VERSION_CACHE_TTL_MINUTES || '60', 10));
const CACHE_TTL_MS = CACHE_TTL_MINUTES * 60 * 1000;
const RETRY_ATTEMPTS = Math.max(1, parseInt(process.env.VERSION_FETCH_RETRY_ATTEMPTS || '3', 10));
const RETRY_DELAY_MS = Math.max(100, parseInt(process.env.VERSION_FETCH_RETRY_DELAY_MS || '600', 10));

const githubHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'toolbatcher-version-updater',
};
if (process.env.GITHUB_TOKEN) {
  githubHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const http = axios.create({ timeout: 10000, headers: { 'User-Agent': 'toolbatcher-version-updater' } });

let cacheData = null;
let cacheDirty = false;

async function log(message, isError = false) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${isError ? 'ERROR: ' : ''}${message}\n`;
  console.log(line.trim());
  try {
    await fs.appendFile(LOG_FILE, line);
  } catch (error) {
    console.error('Failed writing log file:', error.message);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toVersionString(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  if (raw.startsWith('v') && semver.valid(semver.coerce(raw.slice(1)))) {
    return raw.slice(1);
  }
  return raw;
}

function compareVersionStrings(a, b) {
  const aNormalized = toVersionString(a);
  const bNormalized = toVersionString(b);
  const aSem = semver.valid(semver.coerce(aNormalized));
  const bSem = semver.valid(semver.coerce(bNormalized));

  if (aSem && bSem) {
    return semver.compare(aSem, bSem);
  }

  return aNormalized.localeCompare(bNormalized, undefined, { numeric: true, sensitivity: 'base' });
}

async function withRetry(label, fn) {
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await log(`${label} attempt ${attempt}/${RETRY_ATTEMPTS} failed: ${error.message}`, true);
      if (attempt < RETRY_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  throw lastError;
}

async function loadCache() {
  if (cacheData) {
    return cacheData;
  }

  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    cacheData = JSON.parse(raw);
  } catch {
    cacheData = { entries: {} };
  }

  if (!cacheData.entries || typeof cacheData.entries !== 'object') {
    cacheData.entries = {};
  }

  return cacheData;
}

async function saveCache() {
  if (!cacheDirty || !cacheData) {
    return;
  }

  const serializable = JSON.stringify(cacheData, null, 2);
  await fs.writeFile(CACHE_FILE, serializable, 'utf8');
  cacheDirty = false;
}

async function getCachedVersion(cacheKey) {
  const cache = await loadCache();
  const entry = cache.entries[cacheKey];
  if (!entry) {
    return null;
  }

  const age = Date.now() - Number(entry.fetchedAt || 0);
  if (age > CACHE_TTL_MS) {
    return null;
  }

  return entry.version;
}

async function setCachedVersion(cacheKey, version) {
  const cache = await loadCache();
  cache.entries[cacheKey] = {
    version,
    fetchedAt: Date.now(),
  };
  cacheDirty = true;
}

function parseUrl(urlLike) {
  try {
    return new URL(urlLike);
  } catch {
    return null;
  }
}

function normalizeNpmIdentifier(raw) {
  const input = String(raw || '').trim();
  if (!input) {
    throw new Error('NPM sourceIdentifier is required');
  }

  const url = parseUrl(input);
  let value = input;

  if (url) {
    const parts = url.pathname.split('/').filter(Boolean);
    const packageIndex = parts.findIndex((p) => p === 'package');
    if (packageIndex !== -1) {
      value = decodeURIComponent(parts.slice(packageIndex + 1).join('/'));
    }
  }

  const normalized = value.trim();
  const valid = /^(@[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+|[a-zA-Z0-9._-]+)$/.test(normalized);
  if (!valid) {
    throw new Error('Invalid NPM sourceIdentifier format');
  }

  return normalized;
}

function normalizePypiIdentifier(raw) {
  const input = String(raw || '').trim();
  if (!input) {
    throw new Error('PyPI sourceIdentifier is required');
  }

  const url = parseUrl(input);
  let value = input;

  if (url) {
    const parts = url.pathname.split('/').filter(Boolean);
    const projectIndex = parts.findIndex((p) => p === 'project');
    const pypiIndex = parts.findIndex((p) => p === 'pypi');
    if (projectIndex !== -1 && parts[projectIndex + 1]) {
      value = parts[projectIndex + 1];
    } else if (pypiIndex !== -1 && parts[pypiIndex + 1]) {
      value = parts[pypiIndex + 1];
    }
  }

  const normalized = value.trim();
  if (!/^[a-zA-Z0-9._-]+$/.test(normalized)) {
    throw new Error('Invalid PyPI sourceIdentifier format');
  }

  return normalized;
}

function normalizeGithubIdentifier(raw) {
  const input = String(raw || '').trim();
  if (!input) {
    throw new Error('GitHub sourceIdentifier is required');
  }

  const url = parseUrl(input);
  let value = input;

  if (url) {
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      value = `${parts[0]}/${parts[1]}`;
    }
  }

  const normalized = value.trim().replace(/\.git$/, '');
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(normalized)) {
    throw new Error('Invalid GitHub sourceIdentifier format');
  }

  return normalized;
}

function normalizeHomebrewIdentifier(raw) {
  const input = String(raw || '').trim();
  if (!input) {
    throw new Error('Homebrew sourceIdentifier is required');
  }

  const url = parseUrl(input);
  let value = input;

  if (url) {
    const parts = url.pathname.split('/').filter(Boolean);
    const formulaIndex = parts.findIndex((p) => p === 'formula');
    if (formulaIndex !== -1 && parts[formulaIndex + 1]) {
      value = parts[formulaIndex + 1];
    }
  }

  const normalized = value.trim().toLowerCase();
  if (!/^[a-z0-9@+._-]+$/.test(normalized)) {
    throw new Error('Invalid Homebrew sourceIdentifier format');
  }

  return normalized;
}

function normalizeWingetIdentifier(raw) {
  const input = String(raw || '').trim();
  if (!input) {
    throw new Error('Winget sourceIdentifier is required');
  }

  const normalized = input.replace(/^manifests\//i, '').trim();
  if (!/^[A-Za-z0-9_.-]+$/.test(normalized)) {
    throw new Error('Invalid Winget sourceIdentifier format');
  }

  return normalized;
}

async function fetchNpmLatest(identifier) {
  const encodedName = identifier.split('/').map((part) => encodeURIComponent(part)).join('%2F');
  const response = await http.get(`https://registry.npmjs.org/${encodedName}`);
  const latest = response.data?.['dist-tags']?.latest;
  if (!latest) {
    throw new Error(`No latest dist-tag found for npm package ${identifier}`);
  }
  return latest;
}

async function fetchPypiLatest(identifier) {
  const response = await http.get(`https://pypi.org/pypi/${encodeURIComponent(identifier)}/json`);
  const latest = response.data?.info?.version;
  if (!latest) {
    throw new Error(`No version found in PyPI response for ${identifier}`);
  }
  return latest;
}

async function fetchGithubLatest(identifier) {
  try {
    const response = await http.get(`https://api.github.com/repos/${identifier}/releases/latest`, {
      headers: githubHeaders,
    });
    const latest = response.data?.tag_name || response.data?.name;
    if (!latest) {
      throw new Error(`No release tag found for ${identifier}`);
    }
    return toVersionString(latest);
  } catch (error) {
    if (error.response?.status !== 404) {
      throw error;
    }

    const tagResponse = await http.get(`https://api.github.com/repos/${identifier}/tags`, {
      headers: githubHeaders,
      params: { per_page: 1 },
    });

    const latestTag = tagResponse.data?.[0]?.name;
    if (!latestTag) {
      throw new Error(`No tags found for GitHub repository ${identifier}`);
    }

    return toVersionString(latestTag);
  }
}

async function fetchHomebrewLatest(identifier) {
  const response = await http.get(`https://formulae.brew.sh/api/formula/${encodeURIComponent(identifier)}.json`);
  const latest = response.data?.versions?.stable;
  if (!latest) {
    throw new Error(`No stable version found for Homebrew formula ${identifier}`);
  }
  return latest;
}

function extractVersionFromWingetPath(filePath) {
  const segments = String(filePath || '').split('/').filter(Boolean);
  if (segments.length < 3) {
    return '';
  }

  const versionSegment = segments[segments.length - 2];
  if (!versionSegment) {
    return '';
  }

  return versionSegment.trim();
}

async function fetchWingetLatest(identifier) {
  const query = `repo:microsoft/winget-pkgs path:manifests ${identifier} filename:installer.yaml`;
  const response = await http.get('https://api.github.com/search/code', {
    headers: githubHeaders,
    params: {
      q: query,
      per_page: 100,
      sort: 'indexed',
      order: 'desc',
    },
  });

  const items = Array.isArray(response.data?.items) ? response.data.items : [];
  if (items.length === 0) {
    throw new Error(`No winget manifests found for ${identifier}`);
  }

  const versions = Array.from(new Set(items.map((item) => extractVersionFromWingetPath(item.path)).filter(Boolean)));
  if (versions.length === 0) {
    throw new Error(`Could not extract winget version from manifest paths for ${identifier}`);
  }

  versions.sort((a, b) => compareVersionStrings(b, a));
  return versions[0];
}

const providers = {
  npm: {
    normalize: normalizeNpmIdentifier,
    fetchLatest: fetchNpmLatest,
  },
  pypi: {
    normalize: normalizePypiIdentifier,
    fetchLatest: fetchPypiLatest,
  },
  github: {
    normalize: normalizeGithubIdentifier,
    fetchLatest: fetchGithubLatest,
  },
  homebrew: {
    normalize: normalizeHomebrewIdentifier,
    fetchLatest: fetchHomebrewLatest,
  },
  winget: {
    normalize: normalizeWingetIdentifier,
    fetchLatest: fetchWingetLatest,
  },
};

async function fetchLatestWithCache(sourceType, identifier, fetchFn) {
  const cacheKey = `${sourceType}:${identifier}`;
  const cached = await getCachedVersion(cacheKey);
  if (cached) {
    await log(`Cache hit for ${cacheKey}: ${cached}`);
    return cached;
  }

  const latest = await withRetry(`${sourceType}:${identifier}`, () => fetchFn(identifier));
  await setCachedVersion(cacheKey, latest);
  return latest;
}

async function compareVersions(storedVersion, newVersion) {
  if (!storedVersion) return true;

  const storedSem = semver.valid(semver.coerce(storedVersion));
  const newSem = semver.valid(semver.coerce(newVersion));

  if (storedSem && newSem) {
    return semver.gt(newSem, storedSem);
  }

  return compareVersionStrings(newVersion, storedVersion) > 0;
}

async function updateToolVersion(tool, latestVersion) {
  if (await compareVersions(tool.latestVersion, latestVersion)) {
    await log(`New version found for ${tool.toolName}: ${latestVersion} (Previous latest: ${tool.latestVersion || 'None'})`);
    tool.latestVersion = latestVersion;

    if (!Array.isArray(tool.versions)) {
      tool.versions = [];
    }

    tool.versions = [latestVersion, ...tool.versions.filter((version) => version && version !== latestVersion)];

    await tool.save();
    await log(`Successfully updated ${tool.toolName} to version ${latestVersion}`);
    return true;
  }

  await log(`Tool ${tool.toolName} is already up-to-date (Version: ${latestVersion}).`);
  return false;
}

async function updateVersions({ manageConnection = true } = {}) {
  await log('Starting version update process...');

  try {
    if (manageConnection) {
      await connectDB();
    }

    const toolsToCheck = await ToolCommand.find({
      sourceType: { $ne: 'manual' },
      sourceIdentifier: { $ne: '' },
    });

    await log(`Found ${toolsToCheck.length} tools to check for updates.`);

    let checkedCount = 0;
    let updatedCount = 0;

    for (const tool of toolsToCheck) {
      checkedCount += 1;

      const sourceType = String(tool.sourceType || '').toLowerCase();
      await log(`Checking tool: ${tool.toolName} (Source: ${sourceType}, ID: ${tool.sourceIdentifier})`);

      if (sourceType === 'manual') {
        await log(`Skipping manual tool: ${tool.toolName}`);
        await log('---');
        continue;
      }

      const provider = providers[sourceType];
      if (!provider) {
        await log(`Unsupported sourceType '${sourceType}' for ${tool.toolName}. Use npm/pypi/github/homebrew/winget.`, true);
        await log('---');
        continue;
      }

      try {
        const normalizedIdentifier = provider.normalize(tool.sourceIdentifier);
        const latestVersion = await fetchLatestWithCache(sourceType, normalizedIdentifier, provider.fetchLatest);

        if (!latestVersion) {
          await log(`No latest version resolved for ${tool.toolName}`, true);
          await log('---');
          continue;
        }

        if (await updateToolVersion(tool, latestVersion)) {
          updatedCount += 1;
        }
      } catch (error) {
        await log(`Failed update for ${tool.toolName}: ${error.message}`, true);
      }

      await log('---');
    }

    await log(`Version update process finished. Checked: ${checkedCount}, Updated: ${updatedCount}.`);
  } catch (error) {
    await log(`An error occurred during the version update process: ${error.message}`, true);
  } finally {
    try {
      await saveCache();
    } catch (cacheError) {
      await log(`Failed to save provider cache: ${cacheError.message}`, true);
    }

    if (manageConnection) {
      try {
        await mongoose.disconnect();
        await log('Database connection closed.');
      } catch (disconnectError) {
        console.error('Error disconnecting from the database:', disconnectError);
      }
    }
  }
}

if (require.main === module) {
  updateVersions().catch((error) => {
    console.error('Fatal error during update process:', error);
  });
}

module.exports = {
  updateVersions,
};
