const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/userSchma');
const Coin = require('../models/coins');
const Portfolio = require('../models/portfolio');
const Transaction = require('../models/transaction');
const Wallet = require('../models/wallet');

const connectDB = async () => {
  try {
    const mongoURI = 'mongodb://localhost:27017/cryptoo';
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const sampleCoins = [
  {
    c_id: 'bitcoin',
    c_name: 'Bitcoin',
    symbol: 'BTC',
    price: 45000,
    market_cap: 850000000000,
    market_cap_rank: 1,
    price_change_24h: 2.5,
    volume_24h: 25000000000,
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    last_updated: new Date()
  },
  {
    c_id: 'ethereum',
    c_name: 'Ethereum',
    symbol: 'ETH',
    price: 3200,
    market_cap: 380000000000,
    market_cap_rank: 2,
    price_change_24h: 1.8,
    volume_24h: 15000000000,
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    last_updated: new Date()
  },
  {
    c_id: 'binancecoin',
    c_name: 'BNB',
    symbol: 'BNB',
    price: 320,
    market_cap: 50000000000,
    market_cap_rank: 3,
    price_change_24h: 0.5,
    volume_24h: 2000000000,
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    last_updated: new Date()
  },
  {
    c_id: 'solana',
    c_name: 'Solana',
    symbol: 'SOL',
    price: 95,
    market_cap: 40000000000,
    market_cap_rank: 4,
    price_change_24h: 3.2,
    volume_24h: 3000000000,
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    last_updated: new Date()
  },
  {
    c_id: 'cardano',
    c_name: 'Cardano',
    symbol: 'ADA',
    price: 0.45,
    market_cap: 15000000000,
    market_cap_rank: 5,
    price_change_24h: -1.2,
    volume_24h: 800000000,
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    last_updated: new Date()
  },
  {
    c_id: 'polkadot',
    c_name: 'Polkadot',
    symbol: 'DOT',
    price: 6.8,
    market_cap: 8000000000,
    market_cap_rank: 6,
    price_change_24h: 0.8,
    volume_24h: 500000000,
    image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    last_updated: new Date()
  },
  {
    c_id: 'chainlink',
    c_name: 'Chainlink',
    symbol: 'LINK',
    price: 14.5,
    market_cap: 7000000000,
    market_cap_rank: 7,
    price_change_24h: 2.1,
    volume_24h: 600000000,
    image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
    last_updated: new Date()
  },
  {
    c_id: 'litecoin',
    c_name: 'Litecoin',
    symbol: 'LTC',
    price: 68,
    market_cap: 5000000000,
    market_cap_rank: 8,
    price_change_24h: -0.5,
    volume_24h: 400000000,
    image: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
    last_updated: new Date()
  },
  {
    c_id: 'avalanche-2',
    c_name: 'Avalanche',
    symbol: 'AVAX',
    price: 25,
    market_cap: 6000000000,
    market_cap_rank: 9,
    price_change_24h: 1.5,
    volume_24h: 700000000,
    image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    last_updated: new Date()
  },
  {
    c_id: 'dogecoin',
    c_name: 'Dogecoin',
    symbol: 'DOGE',
    price: 0.08,
    market_cap: 11000000000,
    market_cap_rank: 10,
    price_change_24h: 0.3,
    volume_24h: 900000000,
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    last_updated: new Date()
  }
];

const initializeDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Coin.deleteMany({});
    await Portfolio.deleteMany({});
    await Transaction.deleteMany({});
    await Wallet.deleteMany({});
    
    // Create sample coins
    console.log('Adding sample coins...');
    const createdCoins = await Coin.insertMany(sampleCoins);
    console.log(`Added ${createdCoins.length} coins`);
    
    // Create sample user
    console.log('Creating sample user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const sampleUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });
    await sampleUser.save();
    console.log('Sample user created:', sampleUser.email);
    
    // Create wallet for sample user
    console.log('Creating wallet...');
    const wallet = new Wallet({
      userId: sampleUser._id,
      balance: 10000
    });
    await wallet.save();
    console.log('Wallet created with balance: $10,000');
    
    // Create sample portfolio entries
    console.log('Creating sample portfolio entries...');
    const portfolioEntries = [
      {
        userId: sampleUser._id,
        coin_name: 'Bitcoin',
        amount: 0.5,
        avgBuyPrice: 42000
      },
      {
        userId: sampleUser._id,
        coin_name: 'Ethereum',
        amount: 2.0,
        avgBuyPrice: 3000
      },
      {
        userId: sampleUser._id,
        coin_name: 'Solana',
        amount: 10.0,
        avgBuyPrice: 90
      }
    ];
    
    await Portfolio.insertMany(portfolioEntries);
    console.log(`Created ${portfolioEntries.length} portfolio entries`);
    
    // Create sample transactions
    console.log('Creating sample transactions...');
    const transactions = [
      {
        userId: sampleUser._id,
        type: 'buy',
        coinId: 'bitcoin',
        amount: 0.5,
        price: 42000,
        totalValue: 21000,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        userId: sampleUser._id,
        type: 'buy',
        coinId: 'ethereum',
        amount: 2.0,
        price: 3000,
        totalValue: 6000,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        userId: sampleUser._id,
        type: 'buy',
        coinId: 'solana',
        amount: 10.0,
        price: 90,
        totalValue: 900,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];
    
    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} transactions`);
    
    // Setup indexes
    console.log('Setting up indexes...');
    try {
      await Portfolio.collection.createIndex({ userId: 1, coin_name: 1 }, { unique: true });
      console.log('Portfolio compound index created');
    } catch (e) {
      console.log('Portfolio index already exists or error:', e.message);
    }
    
    console.log('Database initialization completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\nSample portfolio:');
    console.log('- 0.5 Bitcoin');
    console.log('- 2.0 Ethereum');
    console.log('- 10.0 Solana');
    console.log('- Wallet balance: $10,000');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

// Run initialization
initializeDatabase();
