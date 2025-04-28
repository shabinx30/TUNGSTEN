const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    price: {
        type:Number,
        required:true
    },
    categoryName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    quantity: {
        small: {
            type: Number,
            required: false
        },
        medium: {
            type: Number,
            required: false
        },
        large: {
            type: Number,
            required: false
        }
    },
    description: {
        type:String,
        required:true
    },
    images: {
        type:Array,
        required:true
    },
    offer: {
        type: Number,
        default: 0
    },
    finalPrice: {
        type: Number,
        default: 0
    },
    is_listed: {
        type:Boolean,
        required:true
    }
})


function arrayLimit (val){
    return val.length <=4
}

//model
module.exports = mongoose.model('Product',productSchema)