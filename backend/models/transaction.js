const { Schema, model } = require("mongoose");

const transactionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['buy', 'sell', 'convert'],
        required: true
    },
    coinId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    totalValue: {
        type: Number,
        required: true
    },
    toCoinId: {
        type: String,
        default: null
    },
    toAmount: {
        type: Number,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Transaction = model("Transaction", transactionSchema);

module.exports = Transaction;
