const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    order:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Order'
    },
    item:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Item'
    }
});

module.exports = mongoose.model('Admin',adminSchema);