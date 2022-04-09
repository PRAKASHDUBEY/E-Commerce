const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcryptjs = require('bcryptjs');
const User = require('../models/user_model');
const auth = require('../middleware/jwt');


//REGISTER
router.post("/register", async (req, res) => {
    const {name, username, email, phone, password} = req.body;
    try{
        let user_email_exist = await User.findOne({email:email});
        let user_name_exist = await User.findOne({username:username});
        let user_phone_exist = await User.findOne({phone:phone});

        
        if(user_email_exist){
            res.status(409).json({
                msg:'User already exist'
            });
        }else if(user_name_exist){
            res.status(400).json({
                msg:'Username not available'
            });
        }else if(user_phone_exist){
            res.status(409).json({
                msg:'User already exist'
            });
        }else{
            let user = new User();

            user.name = name;
            user.username = username;
            user.email = email;
            user.phone = phone;
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(password, salt);

            await user.save();
            const payload ={
                user:{
                    id:user.id
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
    const id= req.body.id;
    const password = req.body.password;
    try{
        let user_email = await User.findOne({
            email:id
        });
        let user_name = await User.findOne({
            username:id
        });
        var user;
        if(!user_email){
            if(!user_name){
                res.status(404).json({
                    msg:'User does not exist, Resister to continue!'
                });
            }else user = user_name;
        }else user = user_email;
        const isMatch = await bcryptjs.compare(password, user.password);    
        if(!isMatch){
            return res.status(401).json({
                msg:'Inavalid Credentials'
            })
        }   
        const payload = {
            user:{
                id:user.id
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

//Reset profile
router.put("/edit-profile" , auth, async (req, res) => {
    try{
        const {name, username, phone} = req.body;
        console.log(name,username,phone);
        let user_name = await User.find({username:username});
        let user_phone = await User.find({phone:phone});
        console.log(user_name,user_phone);
        if(user_name.length!=0){
            return res.status(400).json({
                msg:'Username not available'
            });
        }
        if(user_phone.length!=0){
            return res.status(409).json({
                msg:'User already exist'
            });
        }
        const user = await User.findById(req.user.id);

        user.name=name;
        user.username=username;
        user.phone=phone;
        await user.save();
        res.status(200).json({
            msg:"Profile edited"
        });
    }catch(err){
        res.status(500).json({
            msg:"Server Error"
        })
    }
});

//Reset password
router.put("/reset-password" , auth, async (req, res) => {
    try{
        const {oldpass, newpass} = req.body;
        const user = await User.findById(req.user.id);
        const isMatch = await bcryptjs.compare(oldpass, user.password);    
        if(!isMatch){
            return res.status(401).json({
                msg:'Inavalid Credentials'  
            })
        }
        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(newpass, salt);
        await user.save();
        res.status(200).json({
            msg:"Succesfully Password reset"
        });
    }catch(err){
        res.status(500).json({
            msg:"Server Error"
        })
    }
});

//View profile
router.get("/profile" , auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');

        res.status(200).json({
            User:user
        });
    }catch(err){
        res.status(500).json({
            msg:"Server Error"
        })
    }
});

//Delete profile
router.delete("/delete-profile" , auth, async (req, res) => {
    try{
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({
            msg:'Profile Deleted'
        });
    }catch(err){
        res.status(500).json({
            msg:"Server Error"
        })
    }
});

module.exports = router;