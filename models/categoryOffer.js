const mongoose = require('mongoose')

const CategoryModel = mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
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
    is_activated :{
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('CategoryOffer',CategoryModel)