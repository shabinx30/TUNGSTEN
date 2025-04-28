const mongoose = require('mongoose')

const otpSchema = mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        required:true
    },
    createtAt :{
        type: Date,
        default : Date.now,
        expires : 60
    }
},{versionKey:false});

module.exports = mongoose.model('otp',otpSchema)