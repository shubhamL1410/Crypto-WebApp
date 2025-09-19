const { Schema, model } = require("mongoose");

const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        required: true,
        default: 10000
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

walletSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Wallet = model("Wallet", walletSchema);

module.exports = Wallet;


