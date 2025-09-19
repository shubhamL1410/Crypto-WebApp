require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./db");
const mongoose = require("mongoose");
const priceUpdater = require("./services/priceUpdater");
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
    
    // Add top coins to database on startup (don't block server start)
    console.log('Adding top coins to database...');
    priceUpdater.addTopCoins(20).then(count => {
      console.log(`Successfully added ${count} coins to database`);
    }).catch(err => {
      console.error('Error adding coins on startup:', err.message);
    });
    
    // Start automatic price updates (every 5 minutes)
    priceUpdater.startAutoUpdate(300000);
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Real-time price updates are active');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

