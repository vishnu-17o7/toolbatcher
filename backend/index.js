const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/toolCommandsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

const toolCommandSchema = new mongoose.Schema({
    toolName: String,
    versions: [String],
    commands: {
        linux: String,
        macos: String,
        windows: String
    }
});

const ToolCommand = mongoose.model('ToolCommand', toolCommandSchema);

app.get('/tools', async (req, res) => {
    try {
        const tools = await ToolCommand.find({});
        const toolsWithVersions = tools.map(tool => ({
            name: tool.toolName,
            versions: tool.versions
        }));
        res.json(toolsWithVersions);
    } catch (error) {
        console.error("Error fetching tools:", error);
        res.status(500).json({ error: "Error fetching tools" });
    }
});

// API to generate script based on selected tools, versions, and target OS
app.post('/generate-script', async (req, res) => {
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
});

app.listen(3001, () => {
    console.log("Backend running on port 3001");
});
