const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');

const adminMiddleware = async (req,res,next)=>{
        try{
                const {token} = req.cookies;
                if(!token)
                        throw new Error("Token is not present");
                const payload = jwt.verify(token,process.env.JWT_KEY);
                const {_id} = payload;
                if(!_id){
                        throw new Error("Invalid token");
                }
                const result = await User.findById(_id);
                if (payload.role !== 'admin')//only admin hi admin ko banayega
                        throw new Error("Invalid Token");
                
                if(!result)
                        throw new Error("User Doesn't Exist");

                // (block list mn check bhi to karna padega )
                const IsBlocked = await redisClient.exists(`token:${token}`);//yes or no
                if(IsBlocked)
                        throw new Error("Invalid Token");
                req.result = result;
                next();//user verify to ab next wale pe chala jaaunga
        }
        catch(err){
            res.status(401).send("Error : "+ err.message);
        }
}
module.exports = adminMiddleware;