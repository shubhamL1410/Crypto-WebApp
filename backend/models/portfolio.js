const { Schema, model } = require("mongoose");

const portfolioSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 10000 // Starting balance of $10,000
    },
    holdings: [{
        coinId: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            default: 0
        },
        averagePrice: {
            type: Number,
            default: 0
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Method to get holding for a specific coin
portfolioSchema.methods.getHolding = function(coinId) {
    return this.holdings.find(holding => holding.coinId === coinId);
};

// Method to add or update holding
portfolioSchema.methods.updateHolding = function(coinId, amount, price) {
    let holding = this.getHolding(coinId);
    
    if (holding) {
        // Update existing holding
        const totalValue = (holding.amount * holding.averagePrice) + (amount * price);
        const totalAmount = holding.amount + amount;
        holding.averagePrice = totalValue / totalAmount;
        holding.amount = totalAmount;
    } else {
        // Create new holding
        this.holdings.push({
            coinId: coinId,
            amount: amount,
            averagePrice: price
        });
    }
    
    this.lastUpdated = new Date();
};

// Method to remove holding
portfolioSchema.methods.removeHolding = function(coinId, amount) {
    const holding = this.getHolding(coinId);
    
    if (holding) {
        holding.amount -= amount;
        if (holding.amount <= 0) {
            // Remove holding if amount is 0 or negative
            this.holdings = this.holdings.filter(h => h.coinId !== coinId);
        }
        this.lastUpdated = new Date();
    }
};

const Portfolio = model("Portfolio", portfolioSchema);

module.exports = Portfolio;

