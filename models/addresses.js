const mongoose = require('mongoose')

const addressSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    addresses:[{
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
    }]
},{
    timestamps:true
})

module.exports = mongoose.model('Address',addressSchema)