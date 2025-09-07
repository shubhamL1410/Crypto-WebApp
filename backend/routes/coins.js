const express = require("express");
const Router = express.Router();
const auth = require("../middleware/auth");

const Coin = require("../models/coins");
const Transaction = require("../models/transaction");
const Portfolio = require("../models/portfolio");

Router.get('/', auth, async (req, res) => {
    try {
        const allData = await Coin.find();
        res.status(200).json(allData);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Buy coins
Router.post('/buy', auth, async (req, res) => {
    try {
        const { coinId, amount } = req.body;
        const userId = req.user.id;

        if (!coinId || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid coin ID or amount' });
        }

        // Get coin price
        const coin = await Coin.findOne({ c_id: coinId });
        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' });
        }

        const totalCost = coin.price * amount;

        // Get or create user portfolio
        let portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
            portfolio = new Portfolio({ userId });
        }

        // Check if user has enough balance
        if (portfolio.balance < totalCost) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Update portfolio
        portfolio.balance -= totalCost;
        portfolio.updateHolding(coinId, amount, coin.price);
        await portfolio.save();

        // Create transaction record
        const transaction = new Transaction({
            userId,
            type: 'buy',
            coinId,
            amount,
            price: coin.price,
            totalValue: totalCost
        });
        await transaction.save();

        res.status(200).json({ 
            message: 'Purchase successful',
            balance: portfolio.balance,
            holding: portfolio.getHolding(coinId)
        });

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Sell coins
Router.post('/sell', auth, async (req, res) => {
    try {
        const { coinId, amount } = req.body;
        const userId = req.user.id;

        if (!coinId || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid coin ID or amount' });
        }

        // Get coin price
        const coin = await Coin.findOne({ c_id: coinId });
        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' });
        }

        // Get user portfolio
        const portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
            return res.status(400).json({ message: 'Portfolio not found' });
        }

        // Check if user has enough coins to sell
        const holding = portfolio.getHolding(coinId);
        if (!holding || holding.amount < amount) {
            return res.status(400).json({ message: 'Insufficient coins to sell' });
        }

        const totalValue = coin.price * amount;

        // Update portfolio
        portfolio.balance += totalValue;
        portfolio.removeHolding(coinId, amount);
        await portfolio.save();

        // Create transaction record
        const transaction = new Transaction({
            userId,
            type: 'sell',
            coinId,
            amount,
            price: coin.price,
            totalValue
        });
        await transaction.save();

        res.status(200).json({ 
            message: 'Sale successful',
            balance: portfolio.balance,
            holding: portfolio.getHolding(coinId)
        });

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Convert coins
Router.post('/convert', auth, async (req, res) => {
    try {
        const { fromCoinId, toCoinId, amount } = req.body;
        const userId = req.user.id;

        if (!fromCoinId || !toCoinId || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid parameters' });
        }

        if (fromCoinId === toCoinId) {
            return res.status(400).json({ message: 'Cannot convert to the same coin' });
        }

        // Get coin prices
        const fromCoin = await Coin.findOne({ c_id: fromCoinId });
        const toCoin = await Coin.findOne({ c_id: toCoinId });

        if (!fromCoin || !toCoin) {
            return res.status(404).json({ message: 'Coin not found' });
        }

        // Get user portfolio
        const portfolio = await Portfolio.findOne({ userId });
        if (!portfolio) {
            return res.status(400).json({ message: 'Portfolio not found' });
        }

        // Check if user has enough coins to convert
        const holding = portfolio.getHolding(fromCoinId);
        if (!holding || holding.amount < amount) {
            return res.status(400).json({ message: 'Insufficient coins to convert' });
        }

        const fromValue = fromCoin.price * amount;
        const toAmount = fromValue / toCoin.price;

        // Update portfolio
        portfolio.removeHolding(fromCoinId, amount);
        portfolio.updateHolding(toCoinId, toAmount, toCoin.price);
        await portfolio.save();

        // Create transaction record
        const transaction = new Transaction({
            userId,
            type: 'convert',
            coinId: fromCoinId,
            amount,
            price: fromCoin.price,
            totalValue: fromValue,
            toCoinId,
            toAmount
        });
        await transaction.save();

        res.status(200).json({ 
            message: 'Conversion successful',
            fromHolding: portfolio.getHolding(fromCoinId),
            toHolding: portfolio.getHolding(toCoinId)
        });

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Get transaction history
Router.get('/transactions', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const transactions = await Transaction.find({ userId })
            .sort({ timestamp: -1 })
            .limit(50);

        res.status(200).json(transactions);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Get user portfolio
Router.get('/portfolio', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        let portfolio = await Portfolio.findOne({ userId });
        
        if (!portfolio) {
            portfolio = new Portfolio({ userId });
            await portfolio.save();
        }

        res.status(200).json(portfolio);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = Router;