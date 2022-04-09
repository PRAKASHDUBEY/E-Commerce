const express = require("express");
const router = express.Router();
const bcryptjs = require('bcryptjs');
const jwt = require("jsonwebtoken");
const Admin = require('../models/admin_model');
const Order = require('../models/order_model');
const Item = require('../models/item_model');
const auth = require('../middleware/jwt');

//REGISTER
router.post("/register", async (req, res) => {
    const {email, password} = req.body;
    try{
        let admin_email_exist = await Admin.findOne({email:email});
        
        if(admin_email_exist){
            return res.status(409).json({
                msg:'Admin already exist'
            });
        }else{
            let admin = new Admin();
            admin.email = email;
            const salt = await bcryptjs.genSalt(10);
            admin.password = await bcryptjs.hash(password, salt);

            await admin.save();
            const payload ={
                user:{
                    id:admin.id
                }
            }
            jwt.sign(payload, process.env.jwtUserSecret,{
                expiresIn:30000
            }, (err, token)=>{
                if (err) throw err;
                res.status(201).json({
                    msg:'Registered successfully',
                    token:token
                });
            })
        }
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        })
    }
});

//LOGIN
router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    try{
        let admin = await Admin.findOne({
            email:email
        });
        if(!admin){
            return res.status(404).json({
                msg:'Admin does not exist, Resister to continue!'
            });
        }
        const isMatch = await bcryptjs.compare(password, admin.password);    
        if(!isMatch){
            return res.status(401).json({
                msg:'Inavalid Credentials'
            })
        }   
        const payload = {
            user:{
                id:admin.id
            }
        }   
        jwt.sign(payload, process.env.jwtUserSecret,{
            expiresIn:300000
        },(err, token)=>{
            if (err) throw err;
            res.status(200).json({
                token:token
            });
        })  
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        })
    }
});

//add item
router.post("/add-item", auth, async (req, res) => {
    try{
        const item = await Item.create(req.body);
        item.admin = req.user.id;
        item.save();
        await Admin.findByIdAndUpdate(req.user.id,{
            $push:{item:item.id}
        });

        res.status(201).json({
            msg:'Item added',
            Item:item
        });
    }catch(err){
        res.status(500).json({
            msg:`Server Error`
        });
    }
});

//view order
router.get("/orders", auth, async (req, res) => {
    try{
        const order = await Order.find({$and: [{admin:req.user.id},
            {$or:[{orderedAt:req.query.date},{_id:req.query.id},{user:req.query.userid}]}]})

        res.status(200).json({
            Order:order
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
            msg:`Server Error`
        });
    }
});

module.exports = router;