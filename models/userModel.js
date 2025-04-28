const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        require:true
    },
    phone_number:{
        type:Number,
        // required:true
    },
    password:{
        type:String,
        // required:true
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    is_admin:{
        type:Boolean,
        default:false
    },
    is_verified:{
        type:Boolean,
        default:false
    },
    picture:{
        type:String,
        required:false
    }

},{versionKey:false});

//model
module.exports = mongoose.model('User', userSchema)

