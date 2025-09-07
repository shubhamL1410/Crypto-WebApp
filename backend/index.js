const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./db");
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const users = require("./routes/user");
const portfolio = require("./routes/portfolio");
const coins = require("./routes/coins");

app.use('/api/users', users);
app.use('/api/portfolio', portfolio);
app.use('/api/coins', coins);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Crypto Tracker API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

