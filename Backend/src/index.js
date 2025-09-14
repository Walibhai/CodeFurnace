const express = require('express');

const cors = require('cors'); 
const app=express();
require('dotenv').config();
const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/userAuth');
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemCreator");
const submitRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/user',authRouter);
app.use('/problem',problemRouter);
app.use('/submission',submitRouter);
app.use('/ai',aiRouter);
app.use('/video',videoRouter);
const InitlizeConnection = async ()=>{
        try{
                await Promise.all([redisClient.connect(),main()]);
                console.log("Connected to Redis");
                console.log("Connected to DB");
                app.listen(process.env.PORT,()=>{
                        console.log("Server listening at port number: "+ process.env.PORT);
                })
        }
        catch(err){
                console.log("Error: "+err);
        }
}
InitlizeConnection();