const User = require("../models/user")
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");

const jwt = require('jsonwebtoken');

const redisClient = require('../config/redis');

const Submission = require("../models/submission");

const register = async (req,res)=>{//jo bhi ies register path se aayega wo hamesa as a user hi register hoga
        try{
                //validate the data;
                validate(req.body);
                const {firstName,emailId, password} = req.body;
                req.body.password = await bcrypt.hash(password,10);

                req.body.role = 'user';//always as a user is register hoga (admin nahi)

                // for checking duplicate email id
                // const existingUser = await User.findOne({ emailId });
                // if (existingUser) {
                //         return res.status(400).send("Email already registered");
                // }

                const user = await User.create(req.body);//ye emailId already exist toh nahi karti (yahi se answer mil jaayega)
                
                //jab user register kare tab hi token bhej do
                const token = jwt.sign({_id:user._id,emailId:emailId,role:'user'},process.env.JWT_KEY,{expiresIn: '1h',});
                
                const reply = {
                        firstName:user.firstName,
                        emailId:user.emailId,
                        _id:user._id,
                        role:user.role,
                }
                
                res.cookie('token',token,{maxAge:60*60*1000});//after 1 hour cookies alredy expire ho jaayega
                
                // res.status(201).send("User Registered Successfully");
                res.status(201).json({//in place of send here we use json because using this we can add some extra info here like message
                        user:reply,//password sab nahi bhejni hn frontend ko
                        message:"Singup Successfully"
                })
        }
        catch(error){
                res.status(400).send("Error: "+ error);
        }
}

const login = async (req,res)=>{
        try{
                const {emailId,password} = req.body;
                if(!emailId)
                        throw new Error("Invalid Credentials");
                if(!password)
                        throw new Error("Invalid Credentials");
                const user =await User.findOne({emailId});
                const match = await bcrypt.compare(password,user.password);
                if(!match)
                        throw new Error("Invalid Credentials");


                const reply = {
                        firstName:user.firstName,
                        emailId:user.emailId,
                        _id:user._id,
                        role:user.role,
                }

                const token = jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_Key,{expiresIn:60*60});//in sec
                res.cookie('token',token,{maxAge:60*60*1000});//in msec
                // res.status(200).send("Logged In Successfully");
                res.status(201).json({//in place of send here we use json because using this we can add some extra info here like message
                        user:reply,//password sab nahi bhejni hn frontend ko
                        message:"Login Successfully"
                })
        }
        catch(err)
        {
                res.status(401).send("Error:"+ err);
        }
}

const logout = async (req,res)=>{
        try{
                //validate the token(pahle hi validate kar diya->userAuth.js (routes file));
                
                const {token} = req.cookies;

                const payload = jwt.decode(token);//finding expiry time 
                // console.log(payload);//{    _id: '67fe53263b2ab89885de330b',    emailId: 'mousamkumari@gmail.com',    iat: 1745203313,    exp: 1745205113  }
                
                await redisClient.set(`token:${token}`,"Blocked");//save karane mn kuch time isiliye await
                // await redisClient.expires(`token:${token}`,1800);//after 30 min blocked token automatically deleted//current time kitna time tak valid
                        
                await redisClient.expireAt(`token:${token}`,payload.exp);//ye 1970 1jan se calculate karta hn
                
                res.cookie("token",null,{expires:new Date(Date.now())});//cookies ab deleted from frontend side //null → you're setting the value to null
                res.send("Logged out successfully");
                
                //token add kar dunga Redis ke blockList (jab token ka time end tab Redis se automatically hat jaayega)
                // Cookies ko clear kar dena....
        }
        catch(err)
        {
                res.status(503).send("Error : "+ err.message);
        }
}

const adminRegister = async (req,res)=>{
        try{
                // ->when we use userMiddleware
                // if(req.result.role!='admin')
                //         throw new Error("Invalid Credentials");

                //validate the data;
                validate(req.body);
                const {firstName,emailId, password} = req.body;
                req.body.password = await bcrypt.hash(password,10);

                // req.body.role = 'admin';//dono type ke like user,admin dono create kar sakta hn

                const user = await User.create(req.body);//ye emailId already exist toh nahi karti (yahi se answer mil jaayega)
                
                //jab user register kare tab hi token bhej do           //"admin"
                const token = jwt.sign({_id:user._id,emailId:emailId,role:user.role},process.env.JWT_KEY,{expiresIn: '1h',});
                res.cookie('token',token,{maxAge:60*60*1000});//after 1 hour cookies alredy expire ho jaayega
                
                res.status(201).send("User Registered Successfully");
        }
        catch(error){
                res.status(400).send("Error: "+ error);
        }
}


const deleteProfile=async (req,res)=>{
        try{
                const userId = req.result._id;

                // userSchema se delete
                await User.findByIdAndDelete(userId);

                // Submission schema se bhi delete karna padega (user ne jitna submission kiya hn)
                // await Submission.deleteMany({userId});//all object jisme ye userId ho aus sab ko delete kardo (user.js mn ieska code likh diya hn)

                res.status(200).send("Deleted Successfully");
        }
        catch(error){
                res.status(500).send("Internal Server Error");
        }
} 

module.exports = {register,login,logout,adminRegister,deleteProfile};
