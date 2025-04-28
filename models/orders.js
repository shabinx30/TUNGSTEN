const mongoose = require('mongoose')

const OrderSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderId:{
        type: String,
        required: true
    },
    userName:{
        type: String,
        required: true
    },
    shipAddress:[{
        address_type:{
            type: String,
            required: true
        },
        first_name:{
            type:String,
            required: true
        },
        last_name:{
            type:String,
            required: true
        },
        contry:{
            type:String,
            required: true
        },
        street_name:{
            type:String,
            required: true
        },
        town:{
            type:String,
            required: true
        },
        state:{
            type:String,
            required:true
        },
        postcode:{
            type:String,
            required:true
        },
        phone_number:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        }
    }],
    orderedProducts:[
        {
            productId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: true,

            },
            price: {
                type: Number,
                required: true,

            },
            offerPrice: {
                type: Number,
                requried: true
            },
            offerTotalPrice: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                required: true
            },
            status:{
                type:String,
                require:true,
                default:'pending'
            }
        }
    ],
    purchasedDate: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: Boolean,
        required: true
    },
    orderTime: {
        type: Date,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    subTotal: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Order',OrderSchema)