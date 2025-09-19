const mongoose = require("mongoose");
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI ='mongodb://localhost:27017/cryptoo';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};  

module.exports = connectDB;
