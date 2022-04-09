const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin'
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Item'
    },
    quantity:{
        type:Number,
        default:1
    },
    orderedAt:{
        type:Date,
        default:Date.now
    }

    
});

module.exports = mongoose.model('Order',orderSchema);