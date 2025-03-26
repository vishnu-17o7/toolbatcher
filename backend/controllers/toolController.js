const ToolCommand = require('../models/ToolCommand');
const { spawn } = require('child_process'); // To run the update script
const path = require('path'); // To construct script path

exports.getAllTools = async (req, res) => {
    try {
        const tools = await ToolCommand.find({});
        res.json(tools);
    } catch (error) {
        console.error("Error fetching tools:", error);
        res.status(500).json({ error: "Error fetching tools" });
    }
};

exports.createTool = async (req, res) => {
    try {
        const newTool = new ToolCommand(req.body);
        const savedTool = await newTool.save();
        res.status(201).json(savedTool);
    } catch (error) {
        console.error("Error creating tool:", error);
        res.status(500).json({ error: "Error creating tool" });
    }
};

exports.updateTool = async (req, res) => {
    try {
        const updatedTool = await ToolCommand.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedTool) {
            return res.status(404).json({ error: "Tool not found" });
        }
        res.json(updatedTool);
    } catch (error) {
        console.error("Error updating tool:", error);
        res.status(500).json({ error: "Error updating tool" });
    }
};

exports.deleteTool = async (req, res) => {
    try {
        const deletedTool = await ToolCommand.findByIdAndDelete(req.params.id);
        if (!deletedTool) {
            return res.status(404).json({ error: "Tool not found" });
        }
        res.json({ message: "Tool deleted successfully" });
    } catch (error) {
        console.error("Error deleting tool:", error);
        res.status(500).json({ error: "Error deleting tool" });
    }
};

exports.generateScript = async (req, res) => {
    const { selectedTools, targetOS } = req.body;

    if (!selectedTools || selectedTools.length === 0) {
        return res.status(400).json({ error: "No tools selected" });
    }

    if (!targetOS) {
        return res.status(400).json({ error: "No OS specified" });
    }

    try {
        const toolNames = selectedTools.map(tool => tool.name);
        const tools = await ToolCommand.find({ toolName: { $in: toolNames } });

        let script = "";
        if (targetOS === "linux" || targetOS === "macos") {
            script = "#!/bin/bash\nsudo apt update\n";
        } else if (targetOS === "windows") {
            script = "powershell -Command \"\n";
        }

        tools.forEach(tool => {
            const selectedTool = selectedTools.find(t => t.name === tool.toolName);
            const version = selectedTool ? selectedTool.version : tool.versions[0];
            let command = tool.commands[targetOS];
            // Replace {version} placeholder with actual version
            command = command.replace('{version}', version);
            script += command + "\n";
        });

        if (targetOS === "windows") {
            script += "\"";
        }

        res.json({ script });
    } catch (error) {
        console.error("Error generating script:", error);
        res.status(500).json({ error: "Error generating script" });
    }
};

// Trigger the version update script
exports.triggerUpdateVersions = (req, res) => {
    console.log('API endpoint /update-versions hit. Triggering script...');

    const scriptPath = path.join(__dirname, '..', 'scripts', 'update_versions.js');
    console.log(`Attempting to execute script at: ${scriptPath}`);

    // Spawn the Node.js process to run the script
    const updateProcess = spawn('node', [scriptPath], {
        stdio: 'pipe', // Use pipe to capture stdout/stderr if needed later
        // cwd: path.join(__dirname, '..') // Optional: Set working directory if script relies on it
    });

    // Log script output (optional but helpful for debugging)
    updateProcess.stdout.on('data', (data) => {
        console.log(`Update Script stdout: ${data}`);
    });

    updateProcess.stderr.on('data', (data) => {
        console.error(`Update Script stderr: ${data}`);
    });

    updateProcess.on('close', (code) => {
        console.log(`Update script process exited with code ${code}`);
        // We send a response immediately, the script runs in the background
    });

    updateProcess.on('error', (err) => {
        console.error('Failed to start update script process:', err);
        // We still send a success response to the client, but log the error server-side
    });

    // Respond immediately to the client, indicating the process has started
    res.status(202).json({ message: "Version update process initiated." });
};
