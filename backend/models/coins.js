const { Schema, model } = require("mongoose");

const coinSchema = new Schema({
    c_id: {
        type: String,
        required: true
    },
    c_name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    market_cap: {
        type: Number,
        default: 0
    },
    market_cap_rank: {
        type: Number,
        default: 0
    },
    price_change_24h: {
        type: Number,
        default: 0
    },
    volume_24h: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        default: ''
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
coinSchema.index({ c_id: 1 }, { unique: true });
coinSchema.index({ market_cap_rank: 1 });

const Coins = model("Coin", coinSchema);

module.exports = Coins;