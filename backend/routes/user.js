const express = require("express");
const Router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchma");
const auth = require("../middleware/auth");
const Wallet = require("../models/wallet");

// POST register a new user
Router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        // Create default wallet with 10000 balance
        try {
            const existingWallet = await Wallet.findOne({ userId: user._id });
            if (!existingWallet) {
                await new Wallet({ userId: user._id, balance: 10000 }).save();
            }
        } catch (walletErr) {
            console.error('Failed to create default wallet:', walletErr.message);
            // Do not block registration on wallet failure
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password) and token
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };

        res.status(201).json({
            message: "User created successfully",
            user: userResponse,
            token
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// POST login user
Router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return user data (without password) and token
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };

        res.status(200).json({
            message: "Login successful",
            user: userResponse,
            token
        });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET current user profile (protected route)
Router.get('/profile', auth, async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// GET all users (protected route)
Router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// PUT update user profile (protected route)
Router.put('/profile', auth, async (req, res) => {
    try {
        const { name, email } = req.body;
        const updated = await User.findByIdAndUpdate(
            req.user._id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');
        
        res.status(200).json(updated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// PUT update user by ID (protected route)
Router.put('/users/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const { name, email } = req.body;
        const updated = await User.findByIdAndUpdate(
            id,
            { name, email },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(updated);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

// DELETE user by ID (protected route)
Router.delete('/users/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await User.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});

module.exports = Router;
