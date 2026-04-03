const ToolCommand = require('../models/ToolCommand');

const SUPPORTED_OS = new Set(['linux', 'macos', 'windows']);

function normalizeSelectedTools(selectedTools) {
  if (!Array.isArray(selectedTools) || selectedTools.length === 0) {
    throw new Error('selectedTools must be a non-empty array');
  }

  const normalized = selectedTools
    .map((tool) => ({
      name: typeof tool?.name === 'string' ? tool.name.trim() : '',
      version: typeof tool?.version === 'string' ? tool.version.trim() : '',
    }))
    .filter((tool) => tool.name.length > 0);

  if (normalized.length === 0) {
    throw new Error('selectedTools must include at least one valid tool name');
  }

  return normalized;
}

function replaceVersionToken(commandTemplate, version) {
  if (typeof commandTemplate !== 'string') {
    return '';
  }

  return commandTemplate.split('{version}').join(version);
}

function stripWingetVersionFlag(commandTemplate) {
  if (typeof commandTemplate !== 'string') {
    return '';
  }

  if (!/\bwinget\b/i.test(commandTemplate)) {
    return commandTemplate.trim();
  }

  return commandTemplate
    .replace(/\s+--version(?:=|\s+)\{version\}/gi, '')
    .replace(/\s+-v(?:=|\s+)\{version\}/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function bashEscapeDoubleQuoted(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`');
}

function psSingleQuoteEscape(value) {
  return String(value).replace(/'/g, "''");
}

function toPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

async function buildInstallManifest(selectedTools, targetOS) {
  const os = String(targetOS || '').toLowerCase();
  if (!SUPPORTED_OS.has(os)) {
    throw new Error('targetOS must be one of linux, macos, or windows');
  }

  const normalizedTools = normalizeSelectedTools(selectedTools);
  const toolNames = normalizedTools.map((tool) => tool.name);
  const tools = await ToolCommand.find({ toolName: { $in: toolNames } });
  const byName = new Map(tools.map((tool) => [tool.toolName, tool]));

  const steps = [];

  for (const selected of normalizedTools) {
    const tool = byName.get(selected.name);
    if (!tool) {
      throw new Error(`Tool not found: ${selected.name}`);
    }

    const fallbackVersion = (typeof tool.latestVersion === 'string' && tool.latestVersion.trim())
      || (Array.isArray(tool.versions) && tool.versions.includes('latest') ? 'latest' : '')
      || (Array.isArray(tool.versions) && tool.versions.length > 0 ? tool.versions[0] : 'latest');

    const version = String(selected.version || fallbackVersion).trim() || 'latest';
    const commandTemplate = tool.commands?.[os];

    if (!commandTemplate || typeof commandTemplate !== 'string') {
      throw new Error(`No ${os} command configured for ${selected.name}`);
    }

    let command = replaceVersionToken(commandTemplate, version);
    let fallbackCommand = '';

    if (os === 'windows' && commandTemplate.includes('{version}') && /\bwinget\b/i.test(commandTemplate)) {
      const unpinnedCommand = stripWingetVersionFlag(commandTemplate);
      if (unpinnedCommand && unpinnedCommand !== commandTemplate.trim()) {
        fallbackCommand = unpinnedCommand;
      }

      if (version.toLowerCase() === 'latest' && fallbackCommand) {
        command = fallbackCommand;
      }
    }

    const step = {
      toolName: tool.toolName,
      version,
      command,
    };

    if (fallbackCommand && fallbackCommand !== command) {
      step.fallbackCommand = fallbackCommand;
    }

    steps.push(step);
  }

  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    targetOS: os,
    steps,
  };
}

function renderShellRunner(manifest, options = {}) {
  const steps = Array.isArray(manifest?.steps) ? manifest.steps : [];
  const verifyUrl = bashEscapeDoubleQuoted(options.verifyUrl || '');
  const eventsUrl = bashEscapeDoubleQuoted(options.eventsUrl || '');
  const token = bashEscapeDoubleQuoted(options.token || 'unknown');
  const maxRetries = toPositiveInt(options.maxRetries, 2);

  const lines = [
    '#!/usr/bin/env bash',
    'set -euo pipefail',
    '',
    `VERIFY_URL="${verifyUrl}"`,
    `EVENTS_URL="${eventsUrl}"`,
    `SESSION_TOKEN="${token}"`,
    `MAX_RETRIES=${maxRetries}`,
    `TOTAL_STEPS=${steps.length}`,
    'LOG_FILE="${TMPDIR:-/tmp}/toolbatcher-${SESSION_TOKEN}.log"',
    '',
    'echo "ToolBatcher Installer"',
    'echo "Session: ${SESSION_TOKEN}"',
    'echo "Log file: ${LOG_FILE}"',
    'echo',
    'echo "Selected tools:"',
  ];

  steps.forEach((step, index) => {
    const label = `${index + 1}. ${step.toolName} (${step.version})`;
    lines.push(`echo "  ${bashEscapeDoubleQuoted(label)}"`);
  });

  lines.push('');
  lines.push('emit_event() {');
  lines.push('  local event_type="$1"');
  lines.push('  local status="$2"');
  lines.push('  local message="$3"');
  lines.push('  local tool_name="$4"');
  lines.push('  local step_index="$5"');
  lines.push('  if [ -z "$EVENTS_URL" ]; then return 0; fi');
  lines.push('  curl -fsS -m 4 -X POST "$EVENTS_URL" -H "Content-Type: application/json" -d "{\"eventType\":\"${event_type}\",\"status\":\"${status}\",\"message\":\"${message}\",\"toolName\":\"${tool_name}\",\"stepIndex\":${step_index}}" >/dev/null 2>&1 || true');
  lines.push('}');
  lines.push('');
  lines.push('echo "Verifying manifest signature..."');
  lines.push('verify_json="$(curl -fsSL "$VERIFY_URL" || true)"');
  lines.push('if ! echo "$verify_json" | grep -q "\"valid\":true"; then');
  lines.push('  echo "Manifest signature verification failed."');
  lines.push('  emit_event "manifest_verification" "failed" "signature_invalid" "" 0');
  lines.push('  exit 1');
  lines.push('fi');
  lines.push('emit_event "manifest_verification" "running" "signature_ok" "" 0');
  lines.push('');
  lines.push('read -r -p "Continue with installation? [y/N]: " confirm');
  lines.push('if [[ ! "$confirm" =~ ^[Yy]$ ]]; then');
  lines.push('  echo "Installation cancelled."');
  lines.push('  emit_event "install_cancelled" "cancelled" "cancelled_by_user" "" 0');
  lines.push('  exit 0');
  lines.push('fi');
  lines.push('');
  lines.push('emit_event "install_started" "running" "installation_started" "" 0');
  lines.push('');
  lines.push('run_step() {');
  lines.push('  local step_index="$1"');
  lines.push('  local label="$1"');
  lines.push('  local tool_name="$2"');
  lines.push('  local display_label="$3"');
  lines.push('  local cmd');
  lines.push('  cmd="$(cat)"');
  lines.push('  local attempt=1');
  lines.push('  emit_event "step_started" "running" "step_started" "$tool_name" "$step_index"');
  lines.push('  echo');
  lines.push('  echo "[$step_index/$TOTAL_STEPS] Installing $display_label"');
  lines.push('  while [ "$attempt" -le "$MAX_RETRIES" ]; do');
  lines.push('    echo "Attempt ${attempt}/${MAX_RETRIES}"');
  lines.push('    if bash -lc "$cmd" >>"$LOG_FILE" 2>&1; then');
  lines.push('      echo "Step completed: $display_label"');
  lines.push('      emit_event "step_succeeded" "running" "step_succeeded" "$tool_name" "$step_index"');
  lines.push('      return 0');
  lines.push('    fi');
  lines.push('    if [ "$attempt" -lt "$MAX_RETRIES" ]; then');
  lines.push('      echo "Step failed, retrying..."');
  lines.push('      emit_event "step_retry" "running" "step_retry" "$tool_name" "$step_index"');
  lines.push('      sleep 1');
  lines.push('    fi');
  lines.push('    attempt=$((attempt + 1))');
  lines.push('  done');
  lines.push('  echo "Step failed: $display_label"');
  lines.push('  emit_event "step_failed" "failed" "step_failed" "$tool_name" "$step_index"');
  lines.push('  return 1');
  lines.push('}');

  steps.forEach((step, index) => {
    const label = `${step.toolName} (${step.version})`;
    lines.push('');
    lines.push(`run_step "${index + 1}" "${bashEscapeDoubleQuoted(step.toolName)}" "${bashEscapeDoubleQuoted(label)}" <<'CMD'`);
    lines.push(step.command);
    lines.push('CMD');
    lines.push('if [ $? -ne 0 ]; then');
    lines.push('  echo "Installation aborted. Check log for details."');
    lines.push('  emit_event "install_finished" "failed" "installation_failed" "" 0');
    lines.push('  exit 1');
    lines.push('fi');
  });

  lines.push('');
  lines.push('echo');
  lines.push('echo "Installation complete."');
  lines.push('emit_event "install_finished" "succeeded" "installation_succeeded" "" 0');

  return `${lines.join('\n')}\n`;
}

function renderPowerShellRunner(manifest, options = {}) {
  const steps = Array.isArray(manifest?.steps) ? manifest.steps : [];
  const verifyUrl = psSingleQuoteEscape(options.verifyUrl || '');
  const eventsUrl = psSingleQuoteEscape(options.eventsUrl || '');
  const token = psSingleQuoteEscape(options.token || 'unknown');
  const maxRetries = toPositiveInt(options.maxRetries, 2);

  const lines = [
    "$ErrorActionPreference = 'Stop'",
    'if ($PSVersionTable.PSVersion.Major -ge 7) { $PSNativeCommandUseErrorActionPreference = $false }',
    '$utf8NoBom = [System.Text.UTF8Encoding]::new()',
    '$OutputEncoding = $utf8NoBom',
    '[Console]::InputEncoding = $utf8NoBom',
    '[Console]::OutputEncoding = $utf8NoBom',
    'try { chcp 65001 > $null } catch { }',
    `$VerifyUrl = '${verifyUrl}'`,
    `$EventsUrl = '${eventsUrl}'`,
    `$SessionToken = '${token}'`,
    `$MaxRetries = ${maxRetries}`,
    `$TotalSteps = ${steps.length}`,
    '$LogFile = Join-Path $env:TEMP ("toolbatcher-" + $SessionToken + ".log")',
    "Write-Host 'ToolBatcher Installer' -ForegroundColor Cyan",
    "Write-Host ('Session: ' + $SessionToken)",
    "Write-Host ('Log file: ' + $LogFile)",
    "Write-Host ''",
    "Write-Host 'Selected tools:'",
  ];

  steps.forEach((step, index) => {
    const label = `${index + 1}. ${step.toolName} (${step.version})`;
    lines.push(`Write-Host '  ${psSingleQuoteEscape(label)}'`);
  });

  lines.push('');
  lines.push('function Emit-Event {');
  lines.push('  param(');
  lines.push('    [string]$EventType,');
  lines.push('    [string]$Status,');
  lines.push('    [string]$Message,');
  lines.push('    [string]$ToolName,');
  lines.push('    [int]$StepIndex');
  lines.push('  )');
  lines.push('  if (-not $EventsUrl) { return }');
  lines.push('  try {');
  lines.push('    $payload = @{');
  lines.push('      eventType = $EventType');
  lines.push('      status = $Status');
  lines.push('      message = $Message');
  lines.push('      toolName = $ToolName');
  lines.push('      stepIndex = $StepIndex');
  lines.push('    }');
  lines.push('    Invoke-RestMethod -Method Post -Uri $EventsUrl -ContentType "application/json" -Body ($payload | ConvertTo-Json -Compress) | Out-Null');
  lines.push('  } catch { }');
  lines.push('}');
  lines.push('');
  lines.push("Write-Host 'Verifying manifest signature...' -ForegroundColor Yellow");
  lines.push('try {');
  lines.push('  $verify = Invoke-RestMethod -Method Get -Uri $VerifyUrl');
  lines.push('  if (-not $verify.valid) { throw "Signature invalid" }');
  lines.push('  Emit-Event -EventType "manifest_verification" -Status "running" -Message "signature_ok" -ToolName "" -StepIndex 0');
  lines.push('} catch {');
  lines.push("  Write-Host 'Manifest signature verification failed.' -ForegroundColor Red");
  lines.push('  Emit-Event -EventType "manifest_verification" -Status "failed" -Message "signature_invalid" -ToolName "" -StepIndex 0');
  lines.push('  exit 1');
  lines.push('}');
  lines.push('');
  lines.push("$choice = Read-Host 'Continue with installation? (y/N)'");
  lines.push("if ($choice -notin @('y','Y')) {");
  lines.push("  Write-Host 'Installation cancelled.'");
  lines.push('  Emit-Event -EventType "install_cancelled" -Status "cancelled" -Message "cancelled_by_user" -ToolName "" -StepIndex 0');
  lines.push('  exit 0');
  lines.push('}');
  lines.push('');
  lines.push('Emit-Event -EventType "install_started" -Status "running" -Message "installation_started" -ToolName "" -StepIndex 0');
  lines.push('');
  lines.push('function Invoke-Step {');
  lines.push('  param(');
  lines.push('    [int]$StepIndex,');
  lines.push('    [string]$Label,');
  lines.push('    [string]$ToolName,');
  lines.push('    [string]$Command,');
  lines.push('    [string]$FallbackCommand');
  lines.push('  )');
  lines.push('  Emit-Event -EventType "step_started" -Status "running" -Message "step_started" -ToolName $ToolName -StepIndex $StepIndex');
  lines.push("  Write-Host ''");
  lines.push('  Write-Host ("[{0}/{1}] Installing {2}" -f $StepIndex, $TotalSteps, $Label) -ForegroundColor Yellow');
  lines.push('  for ($attempt = 1; $attempt -le $MaxRetries; $attempt++) {');
  lines.push('    Write-Host ("Attempt {0}/{1}" -f $attempt, $MaxRetries) -ForegroundColor DarkYellow');
  lines.push('    $global:LASTEXITCODE = 0');
  lines.push('    try {');
  lines.push('      Invoke-Expression $Command 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host');
  lines.push('    } catch { }');
  lines.push('    if ($LASTEXITCODE -eq 0) {');
  lines.push('      Emit-Event -EventType "step_succeeded" -Status "running" -Message "step_succeeded" -ToolName $ToolName -StepIndex $StepIndex');
  lines.push('      return');
  lines.push('    }');
  lines.push('');
  lines.push('    $shouldTryFallback = -not [string]::IsNullOrWhiteSpace($FallbackCommand)');
  lines.push('    if ($shouldTryFallback) {');
  lines.push('      $logTail = ""');
  lines.push('      try {');
  lines.push('        if (Test-Path $LogFile) {');
  lines.push('          $logTail = (Get-Content -Path $LogFile -Tail 80 -ErrorAction SilentlyContinue) -join "`n"');
  lines.push('        }');
  lines.push('      } catch { }');
  lines.push('      if ($logTail -match "No version found matching") {');
  lines.push("        Write-Host 'Pinned version unavailable. Trying latest available package...' -ForegroundColor DarkYellow");
  lines.push('        Emit-Event -EventType "step_retry" -Status "running" -Message "fallback_latest" -ToolName $ToolName -StepIndex $StepIndex');
  lines.push('        $fallback = $FallbackCommand');
  lines.push("        $FallbackCommand = ''");
  lines.push('        $global:LASTEXITCODE = 0');
  lines.push('        try {');
  lines.push('          Invoke-Expression $fallback 2>&1 | Tee-Object -FilePath $LogFile -Append | Out-Host');
  lines.push('        } catch { }');
  lines.push('        if ($LASTEXITCODE -eq 0) {');
  lines.push('          Emit-Event -EventType "step_succeeded" -Status "running" -Message "step_succeeded" -ToolName $ToolName -StepIndex $StepIndex');
  lines.push('          return');
  lines.push('        }');
  lines.push('      }');
  lines.push('    }');
  lines.push('    if ($attempt -lt $MaxRetries) {');
  lines.push('      Write-Host "Step failed, retrying..." -ForegroundColor DarkYellow');
  lines.push('      Emit-Event -EventType "step_retry" -Status "running" -Message "step_retry" -ToolName $ToolName -StepIndex $StepIndex');
  lines.push('      Start-Sleep -Seconds 1');
  lines.push('    }');
  lines.push('  }');
  lines.push('  Emit-Event -EventType "step_failed" -Status "failed" -Message "step_failed" -ToolName $ToolName -StepIndex $StepIndex');
  lines.push('  throw "Command failed after retries: $Label"');
  lines.push('}');

  steps.forEach((step, index) => {
    const label = `${step.toolName} (${step.version})`;
    lines.push('');
    lines.push(`$StepCommand${index + 1} = @'`);
    lines.push(step.command);
    lines.push("'@");
    lines.push(`$FallbackCommand${index + 1} = @'`);
    lines.push(step.fallbackCommand || '');
    lines.push("'@");
    lines.push(`Invoke-Step -StepIndex ${index + 1} -Label '${psSingleQuoteEscape(label)}' -ToolName '${psSingleQuoteEscape(step.toolName)}' -Command $StepCommand${index + 1} -FallbackCommand $FallbackCommand${index + 1}`);
  });

  lines.push('');
  lines.push('Emit-Event -EventType "install_finished" -Status "succeeded" -Message "installation_succeeded" -ToolName "" -StepIndex 0');
  lines.push("Write-Host ''");
  lines.push("Write-Host 'Installation complete.' -ForegroundColor Green");

  return `${lines.join('\n')}\n`;
}

module.exports = {
  buildInstallManifest,
  renderShellRunner,
  renderPowerShellRunner,
};