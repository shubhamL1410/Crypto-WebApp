const express = require("express");
const Router = express.Router();
const auth = require("../middleware/auth");

const Coin = require("../models/coins");
const Transaction = require("../models/transaction");
const Portfolio = require("../models/portfolio");
const Wallet = require("../models/wallet");
const priceService = require("../services/priceService");
const priceUpdater = require("../services/priceUpdater");


// Get all coins with real-time prices
Router.get('/', auth, async (req, res) => {
    try {
        const { limit = 50, sortBy = 'market_cap_rank', order = 'asc' } = req.query;
        
        let sortObj = {};
        sortObj[sortBy] = order === 'desc' ? -1 : 1;
        
        const allData = await Coin.find()
            .sort(sortObj)
            .limit(parseInt(limit));
            
        res.status(200).json({
            coins: allData,
            count: allData.length,
            lastUpdated: allData.length > 0 ? allData[0].last_updated : null
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Get top coins from CoinGecko (real-time)
Router.get('/top', auth, async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const topCoins = await priceService.getTopCoins(parseInt(limit));
        res.status(200).json(topCoins);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Search coins
Router.get('/search', auth, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        
        const results = await priceService.searchCoins(q);
        res.status(200).json(results);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// (moved below specific routes to avoid shadowing)

// Buy coins (uses per-coin portfolio entries)
Router.post('/buy', auth, async (req, res) => {
    try {
        const { coinId, amount } = req.body;
        const userId = req.user.id;

        if (!coinId || !amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid coin ID or amount' });
        }

        // Get coin info
        const coin = await Coin.findOne({ c_id: coinId });
        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' });
        }

        const totalCost = coin.price * amount;

        // Ensure wallet exists and has sufficient balance
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet({ userId });
            await wallet.save();
        }
        if (wallet.balance < totalCost) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Deduct
        wallet.balance -= totalCost;
        await wallet.save();

        // Upsert portfolio entry for this coin (by userId + coin_name)
        const existing = await Portfolio.findOne({ userId, coin_name: coin.c_name });
        let newAmount;
        let newAvgBuyPrice;
        if (existing) {
            const prevAmount = existing.amount || 0;
            const prevAvg = existing.avgBuyPrice || 0;
            newAmount = prevAmount + amount;
            newAvgBuyPrice = newAmount > 0 ? ((prevAmount * prevAvg) + (amount * coin.price)) / newAmount : coin.price;
            existing.amount = newAmount;
            existing.avgBuyPrice = newAvgBuyPrice;
            await existing.save();
        } else {
            newAmount = amount;
            newAvgBuyPrice = coin.price;
            await new Portfolio({ userId, coin_name: coin.c_name, amount: newAmount, avgBuyPrice: newAvgBuyPrice }).save();
        }

        // Record transaction
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
            balance: wallet.balance,
            holding: { coinId, amount: newAmount }
        });

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Sell coins (uses per-coin portfolio entries)
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

        // Find user's holding entry by coin_name
        const entry = await Portfolio.findOne({ userId, coin_name: coin.c_name });
        if (!entry || entry.amount < amount) {
            return res.status(400).json({ message: 'Insufficient coins to sell' });
        }

        const totalValue = coin.price * amount;

        // Update or remove entry
        entry.amount -= amount;
        if (entry.amount <= 0) {
            await Portfolio.deleteOne({ _id: entry._id });
        } else {
            await entry.save();
        }

        // Credit wallet
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet({ userId });
        }
        wallet.balance += totalValue;
        await wallet.save();

        // Record transaction
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
            balance: wallet.balance,
            holding: entry.amount > 0 ? { coinId, amount: entry.amount } : null
        });

    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Convert coins (uses per-coin portfolio entries)
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

        // Find user's from holding entry by coin_name
        const fromEntry = await Portfolio.findOne({ userId, coin_name: fromCoin.c_name });
        if (!fromEntry || fromEntry.amount < amount) {
            return res.status(400).json({ message: 'Insufficient coins to convert' });
        }

        const fromValue = fromCoin.price * amount;
        const toAmount = Math.round((fromValue / toCoin.price) * 1000000) / 1000000; // Round to 6 decimal places

        // Decrease from entry
        fromEntry.amount -= amount;
        if (fromEntry.amount <= 0) {
            await Portfolio.deleteOne({ _id: fromEntry._id });
        } else {
            await fromEntry.save();
        }

        // Increase to entry
        const toEntry = await Portfolio.findOne({ userId, coin_name: toCoin.c_name });
        if (toEntry) {
            const prevAmount = toEntry.amount || 0;
            const prevAvg = toEntry.avgBuyPrice || 0;
            const newAmount = prevAmount + toAmount;
            const newAvg = newAmount > 0 ? ((prevAmount * prevAvg) + (toAmount * toCoin.price)) / newAmount : toCoin.price;
            toEntry.amount = newAmount;
            toEntry.avgBuyPrice = newAvg;
            await toEntry.save();
        } else {
            await new Portfolio({ userId, coin_name: toCoin.c_name, amount: toAmount, avgBuyPrice: toCoin.price }).save();
        }

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
            message: 'Conversion successful'
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

// Get user portfolio (returns holdings summary)
Router.get('/portfolio', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const entries = await Portfolio.find({ userId });
        const coins = await Coin.find({}, { c_id: 1, c_name: 1 });
        const nameToId = new Map(coins.map(c => [c.c_name, c.c_id]));
        const holdings = entries.map(e => ({
            coinId: nameToId.get(e.coin_name) || e.coin_name,
            amount: e.amount
        }));
        const wallet = await Wallet.findOne({ userId }) || { balance: 10000 };
        res.status(200).json({ balance: wallet.balance, holdings });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Price management endpoints
Router.post('/refresh-prices', auth, async (req, res) => {
    try {
        await priceUpdater.updateAllPrices();
        res.status(200).json({ message: 'Prices refreshed successfully' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

Router.post('/add-top-coins', auth, async (req, res) => {
    try {
        const { limit = 50 } = req.body;
        const addedCount = await priceUpdater.addTopCoins(limit);
        res.status(200).json({ 
            message: `Added ${addedCount} new coins to database`,
            addedCount 
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

Router.get('/price-status', auth, async (req, res) => {
    try {
        const status = priceUpdater.getStatus();
        res.status(200).json(status);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

Router.post('/start-auto-update', auth, async (req, res) => {
    try {
        const { frequency = 60000 } = req.body; // Default 1 minute
        priceUpdater.startAutoUpdate(frequency);
        res.status(200).json({ 
            message: 'Auto price updates started',
            frequency: frequency 
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

Router.post('/stop-auto-update', auth, async (req, res) => {
    try {
        priceUpdater.stopAutoUpdate();
        res.status(200).json({ message: 'Auto price updates stopped' });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// Get specific coin details (keep last so dynamic route doesn't shadow others)
Router.get('/:coinId', auth, async (req, res) => {
    try {
        const { coinId } = req.params;
        
        // First try to get from database
        let coin = await Coin.findOne({ c_id: coinId });
        
        if (!coin) {
            // If not in database, fetch from API
            const coinDetails = await priceService.getCoinDetails(coinId);
            
            // Save to database for future use
            coin = new Coin({
                c_id: coinDetails.id,
                c_name: coinDetails.name,
                symbol: coinDetails.symbol,
                price: coinDetails.current_price,
                market_cap: coinDetails.market_cap,
                market_cap_rank: coinDetails.market_cap_rank,
                price_change_24h: coinDetails.price_change_24h,
                volume_24h: coinDetails.volume_24h,
                image: coinDetails.image,
                last_updated: new Date(coinDetails.last_updated)
            });
            
            await coin.save();
        }
        
        res.status(200).json(coin);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = Router;