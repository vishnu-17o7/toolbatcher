const mongoose = require('mongoose');
const axios = require('axios');
const { execSync } = require('child_process'); // To run npm view command
const connectDB = require('../config/database'); // Adjust path as needed
const ToolCommand = require('../models/ToolCommand'); // Adjust path as needed

// --- Helper Functions to Fetch Latest Versions ---

async function getNpmVersion(packageName) {
    try {
        // Execute `npm view <package> version` command
        const version = execSync(`npm view ${packageName} version`, { encoding: 'utf8' }).trim();
        console.log(`NPM check for ${packageName}: Found version ${version}`);
        return version;
    } catch (error) {
        console.error(`Error fetching NPM version for ${packageName}: ${error.message}`);
        return null;
    }
}

async function getPypiVersion(packageName) {
    try {
        const response = await axios.get(`https://pypi.org/pypi/${packageName}/json`);
        const version = response.data?.info?.version;
        if (version) {
            console.log(`PyPI check for ${packageName}: Found version ${version}`);
            return version;
        } else {
            console.error(`Could not find version info in PyPI response for ${packageName}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching PyPI version for ${packageName}: ${error.response?.status} ${error.message}`);
        return null;
    }
}

// --- Main Update Logic ---

async function updateVersions() {
    console.log('Starting version update process...');
    await connectDB(); // Connect to the database

    let updatedCount = 0;
    let checkedCount = 0;

    try {
        // Fetch tools that are not manual and have an identifier
        const toolsToCheck = await ToolCommand.find({
            sourceType: { $ne: 'manual' },
            sourceIdentifier: { $ne: '' }
        });

        console.log(`Found ${toolsToCheck.length} tools to check for updates.`);
        checkedCount = toolsToCheck.length;

        for (const tool of toolsToCheck) {
            let latestVersion = null;
            console.log(`Checking tool: ${tool.toolName} (Source: ${tool.sourceType}, ID: ${tool.sourceIdentifier})`);

            switch (tool.sourceType) {
                case 'npm':
                    latestVersion = await getNpmVersion(tool.sourceIdentifier);
                    break;
                case 'pypi':
                    latestVersion = await getPypiVersion(tool.sourceIdentifier);
                    break;
                case 'website':
                    console.log(`Website check for ${tool.toolName} not yet implemented.`);
                    // Placeholder for future website scraping logic
                    break;
                default:
                    console.log(`Unknown sourceType '${tool.sourceType}' for tool ${tool.toolName}`);
            }

            if (latestVersion) {
                // Check if this version is newer or different from the stored latest
                if (tool.latestVersion !== latestVersion) {
                    console.log(`New version found for ${tool.toolName}: ${latestVersion} (Previous latest: ${tool.latestVersion || 'None'})`);
                    tool.latestVersion = latestVersion;

                    // Add to versions array if not already present (prepend to keep it first)
                    if (!tool.versions.includes(latestVersion)) {
                        console.log(`Adding ${latestVersion} to versions array for ${tool.toolName}`);
                        tool.versions.unshift(latestVersion); // Add to the beginning
                        // Optional: Limit the size of the versions array if desired
                        // tool.versions = tool.versions.slice(0, 5); // Keep latest 5 for example
                    }

                    try {
                        await tool.save();
                        updatedCount++;
                        console.log(`Successfully updated ${tool.toolName} to version ${latestVersion}`);
                    } catch (saveError) {
                        console.error(`Failed to save updated tool ${tool.toolName}: ${saveError.message}`);
                    }
                } else {
                    console.log(`Tool ${tool.toolName} is already up-to-date (Version: ${latestVersion}).`);
                }
            } else {
                 console.log(`Could not determine latest version for ${tool.toolName}.`);
            }
             console.log('---'); // Separator between tools
        }

    } catch (error) {
        console.error('An error occurred during the version update process:', error);
    } finally {
        console.log(`Version update process finished. Checked: ${checkedCount}, Updated: ${updatedCount}.`);
        await mongoose.disconnect(); // Disconnect from the database
        console.log('Database connection closed.');
    }
}

// --- Execute the Update Process ---
updateVersions();
