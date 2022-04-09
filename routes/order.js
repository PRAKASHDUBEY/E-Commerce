const express = require("express");
const router = express.Router();
const User = require('../models/user_model');
const Admin = require('../models/admin_model');
const Item = require('../models/item_model');
const Order = require('../models/order_model');
const auth = require('../middleware/jwt');

//view item
router.get("/view" , async (req, res) => {
    try{
        const item = await Item.find({ product: { $regex: req.query.p, $options: "i" }});

        res.status(200).json({
            Item:item
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            msg:`Server Error`
        });
    }
});

//order item
router.post("/order/:id", auth, async (req, res) => {
    try{
        if(req.body.quantity>5){
            res.status(400).json({
                msg:`Only 5 item available`
            });
        }
        var n=5-req.body.quantity;
        const item = await Item.findByIdAndUpdate(req.params.id, {
            $set:{quantity:n}
        });
        console.log(item);
        const order = await Order.create({
            user:req.user.id,
            admin:item.admin,
            product:req.params.id,
            quantity:req.body.quantity
        });
        await User.findByIdAndUpdate(req.user.id, {
            $push:{order:order.id}
        });
        await Admin.findByIdAndUpdate(item.admin, {
            $push:{order:order.id}
        });
        res.status(200).json({
            Order:order,
            msg:"Ordered successfully"
        });
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        });
    }
});

//view order
router.get("/view-order", auth, async (req, res) => {
    try{
        const order = await Order.find({user:req.user.id})
        res.status(200).json({
            Order:order
        });
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        });
    }
});

module.exports = router;