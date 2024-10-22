const mongoose = require('mongoose');

const toolCommandSchema = new mongoose.Schema({
    toolName: String,
    versions: [String],
    commands: {
        linux: String,
        macos: String,
        windows: String
    }
});

module.exports = mongoose.model('ToolCommand', toolCommandSchema);