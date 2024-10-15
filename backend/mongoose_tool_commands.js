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
      versions: ["2.30.0", "2.31.0", "2.32.0"],
      commands: {
        linux: "sudo apt install git={version}",
        macos: "brew install git@{version}",
        windows: "winget install Git.Git -v {version}"
      }
    },
    {
      toolName: "node",
      versions: ["14.17.0", "16.3.0", "17.0.0"],
      commands: {
        linux: "sudo apt install nodejs={version}",
        macos: "brew install node@{version}",
        windows: "winget install OpenJS.NodeJS -v {version}"
      }
    },
    {
      toolName: "python",
      versions: ["3.8.0", "3.9.0", "3.10.0"],
      commands: {
        linux: "sudo apt install python3={version}",
        macos: "brew install python@{version}",
        windows: "winget install Python.Python -v {version}"
      }
    },
    {
      toolName: "docker",
      versions: ["20.10.0", "20.11.0", "20.12.0"],
      commands: {
        linux: "sudo apt install docker.io={version}",
        macos: "brew install --cask docker",
        windows: "winget install Docker.DockerDesktop -v {version}"
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