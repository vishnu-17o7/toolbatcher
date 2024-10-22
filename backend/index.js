const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const toolRoutes = require('./routes/tools');

const app = express();

// Connect to MongoDB
connectDB();

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use('/api/tools', toolRoutes);

const PORT = process.env.PORT || 3002;  // Changed port to 3002
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
