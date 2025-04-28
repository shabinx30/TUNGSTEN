const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    productName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },
    is_activated: {
        type: Boolean,
        default: true,
    }
});

module.exports = mongoose.model('ProductOffer', offerSchema);
