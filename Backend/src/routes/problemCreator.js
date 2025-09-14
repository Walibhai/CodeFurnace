const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');
const problemRouter = express.Router();//create Router

const {CreateProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem} = require("../controllers/userProblem");



//Create
problemRouter.post('/create',adminMiddleware,CreateProblem);
problemRouter.put("/update/:id",adminMiddleware,updateProblem);
problemRouter.delete("/delete/:id",adminMiddleware,deleteProblem);

problemRouter.get('/problemById/:id',userMiddleware,getProblemById);
problemRouter.get('/getAllProblem',userMiddleware,getAllProblem);
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblemByUser);

problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);//pid means problem Id

//Fetch
  
// Update

// Delete
 
module.exports = problemRouter;