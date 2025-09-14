const express = require('express');
const authRouter  = express.Router();//create Router
const {register,login,logout,adminRegister,deleteProfile} = require('../controllers/userAuthent');

const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

//Register
authRouter.post('/register',register);//controllers -> userAuthent.js

//login
authRouter.post('/login',login);
//logout
authRouter.post('/logout',userMiddleware,logout);

authRouter.post('/admin/register',adminMiddleware,adminRegister);//admin hi as a admin kisi ko admin bana sakta hn
// authRouter.post('/admin/register',userMiddleware,adminRegister);//userMiddleware alreay result mn role store hn

//getprofile 
// authRouter.get('/getProfile',getProfile);

authRouter.delete('/deleteProfile',userMiddleware,deleteProfile);


authRouter.get('/check',userMiddleware,(req,res)=>{
        const reply = {
                firstName:req.result.firstName,
                emailId:req.result.emailId,
                _id:req.result._id,
                role:req.result.role,
        }
        res.status(200).json({
                user:reply,
                message:"Valid user"
        })
})


module.exports = authRouter;