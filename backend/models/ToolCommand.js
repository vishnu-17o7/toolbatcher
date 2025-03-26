const mongoose = require('mongoose');

const toolCommandSchema = new mongoose.Schema({
    toolName: String,
    versions: [String],
    commands: {
        linux: String,
        macos: String,
        windows: String
    },
    sourceType: {
        type: String,
        enum: ['npm', 'pypi', 'website', 'manual'], // Define possible source types
        default: 'manual' // Default to manual if not specified
    },
    sourceIdentifier: {
        type: String, // e.g., package name 'react', url 'https://nodejs.org/dist/latest-v18.x/'
        default: ''
    },
    latestVersion: {
        type: String, // Store the most recently fetched latest version
        default: ''
    }
});

module.exports = mongoose.model('ToolCommand', toolCommandSchema);
