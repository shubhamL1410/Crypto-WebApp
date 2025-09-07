const express = require("express");
const Router = express.Router();
const auth = require("../middleware/auth");

const Portfolio = require("../models/portfolio");

// All portfolio routes now require authentication
Router.get('/portfolio', auth, async (req, res) => {
    try {
        const allData = await Portfolio.find({ userId: req.user._id }).populate('userId', 'name email');
        res.status(200).json(allData);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

Router.get('/portfolio/:uid', auth, async (req, res) => {
    try {
        const uid = req.params.uid;
        // Only allow users to access their own portfolio
        if (uid !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied. You can only view your own portfolio." });
        }
        const allData = await Portfolio.find({ userId: uid });
        res.status(200).json(allData);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

Router.post('/portfolio', auth, async (req, res) => {
    try {
        const { coin_name, amount } = req.body;
        const u = new Portfolio({
            userId: req.user._id,
            coin_name,
            amount
        });
        await u.save();
        res.status(201).json(u);
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// 🔄 Update portfolio entry by ID (protected)
Router.put('/portfolio/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, avgBuyPrice } = req.body;
        
        // Verify the portfolio entry belongs to the authenticated user
        const portfolioEntry = await Portfolio.findById(id);
        if (!portfolioEntry) {
            return res.status(404).json({ message: "Portfolio not found" });
        }
        
        if (portfolioEntry.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied. You can only update your own portfolio." });
        }
        
        const updated = await Portfolio.findByIdAndUpdate(
            id,
            { amount, avgBuyPrice },
            { new: true, runValidators: true }
        );
        res.status(200).json(updated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// ❌ Delete portfolio by ID (protected)
Router.delete('/portfolio/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verify the portfolio entry belongs to the authenticated user
        const portfolioEntry = await Portfolio.findById(id);
        if (!portfolioEntry) {
            return res.status(404).json({ message: "Portfolio not found" });
        }
        
        if (portfolioEntry.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied. You can only delete your own portfolio entries." });
        }
        
        const deleted = await Portfolio.findByIdAndDelete(id);
        res.status(200).json({ message: "Portfolio deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = Router;