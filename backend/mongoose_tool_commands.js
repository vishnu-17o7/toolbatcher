const mongoose = require('mongoose');

// Connect to the toolCommandsDB database (note the capital DB)
mongoose.connect('mongodb://localhost/toolCommandsDB');

// Define the schema for toolcommands
const toolCommandSchema = new mongoose.Schema({
  toolName: String,
  versions: [String],
  commands: {
    linux: String,
    macos: String,
    windows: String,
  },
});

// Create a model based on the schema
const ToolCommand = mongoose.model('ToolCommand', toolCommandSchema);

// Function to insert sample data
async function insertSampleData() {
  const sampleData = [
    {
      toolName: "git",
      versions: ["latest"],
      commands: {
        linux: "sudo apt install git={version}",
        macos: "brew install git@{version}",
        windows: "winget install --id Git.Git --exact --accept-source-agreements --accept-package-agreements"
      }
    },
    {
      toolName: "node",
      versions: ["latest"],
      commands: {
        linux: "sudo apt install nodejs={version}",
        macos: "brew install node@{version}",
        windows: "winget install --id OpenJS.NodeJS.LTS --exact --accept-source-agreements --accept-package-agreements"
      }
    },
    {
      toolName: "python",
      versions: ["latest"],
      commands: {
        linux: "sudo apt install python3={version}",
        macos: "brew install python@{version}",
        windows: "winget install --id Python.Python.3.12 --exact --accept-source-agreements --accept-package-agreements"
      }
    },
    {
      toolName: "docker",
      versions: ["latest"],
      commands: {
        linux: "sudo apt install docker.io={version}",
        macos: "brew install --cask docker",
        windows: "winget install --id Docker.DockerDesktop --exact --accept-source-agreements --accept-package-agreements"
      }
    }
  ];

  try {
    await ToolCommand.deleteMany({}); // Clear existing data
    await ToolCommand.insertMany(sampleData);
    console.log("Sample data inserted");
  } catch (error) {
    console.error("Error inserting sample data:", error);
  }
}

// Main function to run all operations
async function main() {
  try {
    // Insert sample data
    await insertSampleData();

    // Query all documents in the toolcommands collection
    console.log("All tool commands:");
    const allTools = await ToolCommand.find();
    console.log(allTools);

    console.log("\nMongoose script for toolCommandsDB executed successfully!");
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
  }
}

// Run the main function
main();