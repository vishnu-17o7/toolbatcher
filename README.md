# Toolbatcher

## 1. Abstract
Toolbatcher is a web application designed to streamline developers' workflows by allowing them to create, manage, and execute custom batches of command-line tools. It provides an intuitive interface for selecting tools, specifying versions, and generating scripts that can be easily run across different operating systems.

## 2. Modules
1. **Tool Selection**: Allows users to choose from a variety of command-line tools and specify their versions.
2. **OS Targeting**: Enables users to select the target operating system for their script generation.
3. **Script Generation**: Generates custom scripts based on the selected tools and target OS.
4. **Script Preview**: Provides users with a preview of the generated script before downloading.
5. **Script Download**: Allows users to download the generated script in the appropriate format for their target OS.
6. **Documentation**: Offers comprehensive documentation on how to use the Toolbatcher platform and individual tools.

## 3. Software Used
- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Version Control**: Git
- **Package Manager**: npm

## 4. How to Use
To use Toolbatcher, follow these steps:
npm install
cd frontend
npm install
cd backend
npm install

Create a .env file in the backend directory with the following environment variables:
- PORT=5000
- NODE_ENV=development
- MONGO_URI=your_mongodb_uri

Run the following commands to start the frontend and backend servers:
npm run dev (in the root directory)