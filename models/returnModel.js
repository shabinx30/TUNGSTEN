// returnSchema.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const returnSchema = new Schema({
    reason: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    orderId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    shipAddress: {
        address_type: {
            type: String,
            required: true,
        },
        first_name: {
            type: String,
            required: true,
        },
        last_name: {
            type: String,
            required: true,
        },
        contry: {
            type: String,
            required: true,
        },
        street_name: {
            type: String,
            required: true,
        },
        town: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        postcode: {
            type: String,
            required: true,
        },
        phone_number: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    },
    orderedProducts: {
        productId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "Product",
        },
        quantity: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            require: true,
            default: "pending",
        },
        _id: {
            type: mongoose.Types.ObjectId,
            required: true
        }
    },
    purchasedDate: {
        type: String,
        required: true,
    },
    returnedDate: {
        type: String,
        required: true
    },   
    paymentMethod: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: Boolean,
        required: true,
    }
});

const Return = mongoose.model("Return", returnSchema);

module.exports = Return;
