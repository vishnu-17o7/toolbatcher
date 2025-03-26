# Toolbatcher

**Name**: Vishnu V
**Department**: Msc Artificial Intelligence and Machine Learning
**Roll Number**: 71762234060

## Abstract
Toolbatcher is a web application designed to streamline developers' workflows by allowing them to create, manage, and execute custom batches of command-line tools. It provides an intuitive interface for selecting tools, specifying versions, and generating scripts that can be easily run across different operating systems.

## Modules and Functionalities

### 1. Frontend Modules

#### Core Components
- **Navbar**: Navigation component providing access to different sections of the application
- **Hero**: Landing page component showcasing main features
- **ToolSelector**: Interactive component for selecting development tools
- **CodeEditor**: Component for displaying and copying installation commands
- **FeedbackForm**: User feedback collection interface
- **Documentation**: Comprehensive usage guidelines and documentation
- **AdminPage**: Administrative interface for managing tool data and feedback

#### Features
- Responsive design using TailwindCSS
- Cross-browser compatibility
- Interactive UI elements
- Real-time command generation
- Copy-to-clipboard functionality
- Form validation
- Admin dashboard

### 2. Backend Modules

#### API Controllers
- **toolController**: Manages tool-related operations
- **feedbackController**: Handles feedback submission and retrieval

#### Data Models
- **ToolCommand**: Schema for tool installation commands
- **Feedback**: Schema for user feedback storage

#### Routes
- **/api/tools**: Tool management endpoints
- **/api/feedback**: Feedback management endpoints

## Software Stack

### Frontend
- React.js (v18)
- Vite.js
- TailwindCSS
- PostCSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM

### Development Tools
- Git
- npm/yarn
- VS Code
- MongoDB Compass

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