const { Schema, model } = require("mongoose");

const portfolioSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coin_name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    avgBuyPrice: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
portfolioSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Portfolio = model("Portfolio", portfolioSchema);

// Ensure correct indexes: allow multiple coins per user, enforce uniqueness per (user, coin)
try {
    // Compound unique index on (userId, coin_name)
    portfolioSchema.index({ userId: 1, coin_name: 1 }, { unique: true });
} catch (e) {
    // no-op if already defined
}

module.exports = Portfolio;