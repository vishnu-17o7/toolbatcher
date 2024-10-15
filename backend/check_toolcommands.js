const mongoose = require('mongoose');

// Connect to the toolCommandsDB database
mongoose.connect('mongodb://localhost/toolCommandsDB');

// Define the schema for toolcommands
const toolCommandSchema = new mongoose.Schema({
  toolName: String,
  commands: {
    linux: String,
    macos: String,
    windows: String,
  },
});

const ToolCommand = mongoose.model('ToolCommand', toolCommandSchema);

  async function main() {
  try {
    console.log("All tool commands:");
    const allTools = await ToolCommand.find();
    console.log(JSON.stringify(allTools, null, 2));

    console.log("\nNumber of documents:");
    const count = await ToolCommand.countDocuments();
    console.log(count);

  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await mongoose.connection.close();
  }
}

main();