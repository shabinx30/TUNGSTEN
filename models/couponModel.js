const mongoose = require('mongoose');

const CouponModel = mongoose.Schema({
    couponCode: {
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
    cryteriaAmount: {
        type: Number,
        required: true
    },
    claimed: {
        type: Boolean,
        default: false

    },
    is_activated :{
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('Coupon', CouponModel);
