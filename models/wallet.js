const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    balance: {
        type: mongoose.Schema.Types.Decimal128,
        required: true
    },
    transactionHistory: [{
        amount: {
            type: mongoose.Schema.Types.Decimal128,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        paymentMethod: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true
        }
    }]
});

module.exports = mongoose.model('Wallet', walletSchema);