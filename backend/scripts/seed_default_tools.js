const mongoose = require('mongoose');
const connectDB = require('../config/database');
const ToolCommand = require('../models/ToolCommand');

const DEFAULT_TOOLS = [
  {
    toolName: 'git',
    versions: ['latest'],
    commands: {
      linux: 'sudo apt-get update && sudo apt-get install -y git',
      macos: 'brew install git',
      windows: 'winget install --id Git.Git --exact --accept-source-agreements --accept-package-agreements',
    },
    sourceType: 'github',
    sourceIdentifier: 'git/git',
  },
  {
    toolName: 'node',
    versions: ['latest'],
    commands: {
      linux: 'sudo apt-get update && sudo apt-get install -y nodejs npm',
      macos: 'brew install node',
      windows: 'winget install --id OpenJS.NodeJS.LTS --exact --accept-source-agreements --accept-package-agreements',
    },
    sourceType: 'github',
    sourceIdentifier: 'nodejs/node',
  },
  {
    toolName: 'python',
    versions: ['latest'],
    commands: {
      linux: 'sudo apt-get update && sudo apt-get install -y python3 python3-pip',
      macos: 'brew install python',
      windows: 'winget install --id Python.Python.3.12 --exact --accept-source-agreements --accept-package-agreements',
    },
    sourceType: 'github',
    sourceIdentifier: 'python/cpython',
  },
  {
    toolName: 'docker',
    versions: ['latest'],
    commands: {
      linux: 'sudo apt-get update && sudo apt-get install -y docker.io',
      macos: 'brew install --cask docker',
      windows: 'winget install --id Docker.DockerDesktop --exact --accept-source-agreements --accept-package-agreements',
    },
    sourceType: 'github',
    sourceIdentifier: 'docker/cli',
  },
  {
    toolName: 'pnpm',
    versions: ['latest'],
    commands: {
      linux: 'npm install -g pnpm',
      macos: 'npm install -g pnpm',
      windows: 'npm install -g pnpm',
    },
    sourceType: 'npm',
    sourceIdentifier: 'pnpm',
  },
  {
    toolName: 'bun',
    versions: ['latest'],
    commands: {
      linux: 'curl -fsSL https://bun.sh/install | bash',
      macos: 'curl -fsSL https://bun.sh/install | bash',
      windows: 'powershell -ExecutionPolicy Bypass -Command "irm https://bun.sh/install.ps1 | iex"',
    },
    sourceType: 'github',
    sourceIdentifier: 'oven-sh/bun',
  },
  {
    toolName: 'gh',
    versions: ['latest'],
    commands: {
      linux: 'sudo apt-get update && sudo apt-get install -y gh',
      macos: 'brew install gh',
      windows: 'winget install --id GitHub.cli --exact --accept-source-agreements --accept-package-agreements',
    },
    sourceType: 'github',
    sourceIdentifier: 'cli/cli',
  },
  {
    toolName: 'uv',
    versions: ['latest'],
    commands: {
      linux: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
      macos: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
      windows: 'powershell -ExecutionPolicy Bypass -Command "irm https://astral.sh/uv/install.ps1 | iex"',
    },
    sourceType: 'github',
    sourceIdentifier: 'astral-sh/uv',
  },
  {
    toolName: 'deno',
    versions: ['latest'],
    commands: {
      linux: 'curl -fsSL https://deno.land/install.sh | sh',
      macos: 'curl -fsSL https://deno.land/install.sh | sh',
      windows: 'powershell -ExecutionPolicy Bypass -Command "irm https://deno.land/install.ps1 | iex"',
    },
    sourceType: 'github',
    sourceIdentifier: 'denoland/deno',
  },
  {
    toolName: 'fastfetch',
    versions: ['latest'],
    commands: {
      linux: 'sudo apt-get update && sudo apt-get install -y fastfetch',
      macos: 'brew install fastfetch',
      windows: 'winget install --id Fastfetch-cli.Fastfetch --exact --accept-source-agreements --accept-package-agreements',
    },
    sourceType: 'github',
    sourceIdentifier: 'fastfetch-cli/fastfetch',
  },
];

function mergeVersions(existingVersions, defaultVersions) {
  const merged = [
    ...(Array.isArray(existingVersions) ? existingVersions : []),
    ...(Array.isArray(defaultVersions) ? defaultVersions : []),
  ];
  return Array.from(new Set(merged.filter(Boolean)));
}

function prioritizeLatestVersion(versions, latestVersion) {
  if (!Array.isArray(versions)) {
    return [];
  }

  const latest = typeof latestVersion === 'string' ? latestVersion.trim() : '';
  if (!latest) {
    if (versions.includes('latest')) {
      return ['latest', ...versions.filter((version) => version && version !== 'latest')];
    }
    return versions;
  }

  return [latest, ...versions.filter((version) => version && version !== latest)];
}

function normalizeLegacyWingetCommand(command, defaultCommand) {
  if (typeof command !== 'string' || command.trim().length === 0) {
    return defaultCommand;
  }

  const normalized = command.trim();
  const looksLikeWinget = /\bwinget\b/i.test(normalized);
  const hasVersionPlaceholder = normalized.includes('{version}');
  const hasVersionFlag = /\s(?:--version|-v)(?:=|\s+)/i.test(normalized);

  if (looksLikeWinget && (hasVersionPlaceholder || hasVersionFlag)) {
    return defaultCommand;
  }

  return normalized;
}

function mergeCommands(existingCommands, defaultCommands) {
  const mergedWindows = normalizeLegacyWingetCommand(
    existingCommands?.windows || defaultCommands.windows,
    defaultCommands.windows,
  );

  return {
    linux: existingCommands?.linux || defaultCommands.linux,
    macos: existingCommands?.macos || defaultCommands.macos,
    windows: mergedWindows,
  };
}

async function upsertDefaultTool(tool, logger) {
  const existing = await ToolCommand.findOne({ toolName: tool.toolName });

  if (!existing) {
    await ToolCommand.create(tool);
    logger.log(`Seeded tool: ${tool.toolName}`);
    return 'inserted';
  }

  let changed = false;

  const mergedVersions = prioritizeLatestVersion(
    mergeVersions(existing.versions, tool.versions),
    existing.latestVersion,
  );
  if (JSON.stringify(mergedVersions) !== JSON.stringify(existing.versions || [])) {
    existing.versions = mergedVersions;
    changed = true;
  }

  const mergedCommands = mergeCommands(existing.commands, tool.commands);
  const existingCommands = existing.commands || {};
  if (
    mergedCommands.linux !== existingCommands.linux ||
    mergedCommands.macos !== existingCommands.macos ||
    mergedCommands.windows !== existingCommands.windows
  ) {
    existing.commands = mergedCommands;
    changed = true;
  }

  const shouldUpgradeProvider = !existing.sourceIdentifier || existing.sourceType === 'manual' || existing.sourceType === 'website';
  if (shouldUpgradeProvider) {
    existing.sourceType = tool.sourceType;
    existing.sourceIdentifier = tool.sourceIdentifier;
    changed = true;
  }

  if (changed) {
    await existing.save();
    logger.log(`Updated existing tool metadata: ${tool.toolName}`);
    return 'updated';
  }

  logger.log(`Tool already up-to-date in seed set: ${tool.toolName}`);
  return 'unchanged';
}

async function seedDefaultTools({ logger = console } = {}) {
  const summary = {
    inserted: 0,
    updated: 0,
    unchanged: 0,
    total: DEFAULT_TOOLS.length,
  };

  for (const tool of DEFAULT_TOOLS) {
    const result = await upsertDefaultTool(tool, logger);
    summary[result] += 1;
  }

  logger.log(`Tool seeding complete. inserted=${summary.inserted}, updated=${summary.updated}, unchanged=${summary.unchanged}`);
  return summary;
}

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await seedDefaultTools({ logger: console });
    } catch (error) {
      console.error('Failed to seed default tools:', error);
      process.exitCode = 1;
    } finally {
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        console.error('Failed to disconnect after seeding:', disconnectError);
      }
    }
  })();
}

module.exports = {
  DEFAULT_TOOLS,
  seedDefaultTools,
};
