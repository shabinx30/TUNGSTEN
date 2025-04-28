const mongoose = require('mongoose');

const wishlistSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    products: [{
        productId:{
            type: mongoose.mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    }]
})

module.exports = mongoose.model('wishlist',wishlistSchema)