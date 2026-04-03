const ToolCommand = require('../models/ToolCommand');

async function generateDynamicScript(selectedTools, targetOS) {
  // selectedTools: [{ name, version }]
  const toolNames = selectedTools.map(t => t.name);
  const tools = await ToolCommand.find({ toolName: { $in: toolNames } });
  let header = '';
  let footer = '';
  if (targetOS === 'windows') {
    header = "# PowerShell dynamic install script\n";
  } else {
    header = "#!/usr/bin/env bash\nset -e\n" +
      "# Basic disk space check (needs at least 200MB free)\n" +
      "avail=$(df -Pm . | tail -1 | awk '{print $4}')\n" +
      "if [ \"$avail\" -lt 200 ]; then echo 'Not enough disk space'; exit 1; fi\n";
    footer = "\necho 'All selected tools processed.'\n";
  }
  let body = '';
  for (const tool of tools) {
    const chosen = selectedTools.find(t => t.name === tool.toolName);
    const version = chosen?.version || tool.versions[0];
    let command = tool.commands[targetOS] || '';
    command = command.replace('{version}', version);
    body += `\n# ${tool.toolName} (${version})\n${command}\n`;
  }
  return header + body + footer;
}

module.exports = { generateDynamicScript };
