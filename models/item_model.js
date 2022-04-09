const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin'
    },
    product:String,
    size:String,
    colour:String,
    quantity:{
        type:Number,
        default:5
    },
    price:Number
});

module.exports = mongoose.model('Item',itemSchema);