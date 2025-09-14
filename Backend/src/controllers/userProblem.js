
const {getLanguageById,submitBatch,submitToken} = require("../utils/problemUtility");
const Problem = require('../models/problem');
const User = require('../models/user');
const Submission = require("../models/submission");

//Day-23
const SolutionVideo = require("../models/solutionVideo");

const CreateProblem = async (req,res)=>{

        const {title, description,difficulty, tags, visibleTestCases,hiddenTestCases,
                startCode,referenceSolution,problemCreator}=req.body;
        
        try{

                for(const {language,completeCode} of referenceSolution){

                        //source_code:
                        // language_id:
                        // stdin:
                        // expected_output:
 
                        const languageId = getLanguageById(language);//under utils
                        
                        // I am creating Batch submission ( c++ ke liye ek batch ban jaayega , fir then java ka jitne bhi test cases hn uska batch bana diya)
                        const submissions = visibleTestCases.map((testcase)=>({
                                source_code:completeCode,
                                language_id: languageId,
                                stdin: testcase.input,
                                expected_output:testcase.output
                        }));
                        const submitResult = await submitBatch(submissions);//under utils // it return a token

                        const resultToken = submitResult.map((value)=>value.token);//["dce7bbc5-a8c9-4159-a28f-ac264e48c371","1ed737ca-ee34-454d-a06f-bbc73836473e","9670af73-519f-4136-869c-340086d406db"]
                        
                        const testResult = await submitToken(resultToken);//it takes tokena and give status_id (by which we can find our code is submit or not)

                        // console.log(testResult);//using this we can find out the responses of judge0 when any code submitted

                        for(const test of testResult){
                                if(test.status_id!=3){
                                      return  res.status(400).send("Error Occured");//agar ek yaha pe cursor aa gaya to return kardo . Phir se ye line na execute ho
                                }
                        }
                }

                //We can store code in our DB (if curser here that means all codes execute successfull and accepted)
                await Problem.create({
                        ...req.body,
                        problemCreator: req.result._id //using middle ware i find out who is the problem creator
                })

                res.status(200).send("Problem Saved Successfully");
        }
        catch(err){
                res.status(400).send("Error: "+err);
        }
}

const updateProblem = async (req,res)=>{
        const { id } = req.params; // Assume problem ID is in the URL like /api/problems/:id
        const {title, description,difficulty, tags, visibleTestCases,hiddenTestCases,//(which ever data comes from frontend at first we have to check all are correct or not)
                startCode,referenceSolution,problemCreator}=req.body; // Contains updated fields like title, description, etc.

        try {
                if(!id){
                        return res.status(400).send("Missing ID field");
                }
                const DsaProblem = await Problem.findById(id);
                if(!DsaProblem){
                        return res.status(404).send("ID is not present in the server");
                }
                for(const {language,completeCode} of referenceSolution){
 
                        //source_code:
                        // language_id:
                        // stdin:
                        // expected_output:

                        const languageId = getLanguageById(language);//under utils
                        
                        // I am creating Batch submission ( c++ ke liye ek batch ban jaayega , fir then java ka jitne bhi test cases hn uska batch bana diya)
                        const submissions = visibleTestCases.map((testcase)=>({
                                source_code:completeCode,
                                language_id: languageId,
                                stdin: testcase.input,
                                expected_output:testcase.output
                        }));
                        const submitResult = await submitBatch(submissions);//under utils // it return a token

                        const resultToken = submitResult.map((value)=>value.token);//["dce7bbc5-a8c9-4159-a28f-ac264e48c371","1ed737ca-ee34-454d-a06f-bbc73836473e","9670af73-519f-4136-869c-340086d406db"]
                        
                        const testResult = await submitToken(resultToken);//it takes tokena and give status_id (by which we can find our code is submit or not)

                        for(const test of testResult){
                                if(test.status_id!=3){
                                      return  res.status(400).send("Error Occured");//agar ek yaha pe cursor aa gaya to return kardo . Phir se ye line na execute ho
                                }
                        }
                }
                const newProblem = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});//runValidators bydefault false hota hn , lekin ham update karate time check karna hn ki schema define karte time jo validator lagaya th wo sab kuch thik hn ki nahi , new:true means ab jo new Object bana hn update karne ke baad usko return kardo
                res.status(200).send(newProblem);
        } 
        catch(error)
        {
                res.status(400).send("Error: "+ error);
        }
}

const deleteProblem = async (req,res)=>{
        const {id}=req.params;
        try{
                if(!id)
                        return res.status(400).send("ID is Missing");
                const deletedProblem = await Problem.findByIdAndDelete(id);//delete than wo deletedProblem mn aajayega nahi to undefined ya kuch aajayega if us id ka problem exist nahi karta to
                if(!deletedProblem)
                        return res.status(404).send("Problem is Missing");

                res.status(200).send("Successfully Deleted");
        }
        catch(err){
                res.status(500).send("Error :"+ err);
        }
}

const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).send("ID is Missing");

        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution ');//when user make request using problemId only these info user will get as a response

        if (!getProblem)
                 return res.status(404).send("Problem not found");
        
        // video ka jo bhi url wagera le aao (Day-23)
        const videos = await SolutionVideo.findOne({problemId:id});
        if(videos){ //agar video exist karti hn to //yaha pe ye bhi kar sakta th agar user paid hn to video bhej do nahi to nahi
                
                const responseData = {
                        ...getProblem.toObject(),//mongodb ke document ko js ke object mn convert karna padega
                        secureUrl : videos.secureUrl,
                        thumbnailUrl : videos.thumbnailUrl,
                        duration : videos.duration
                }
                
                // getProblem.secureUrl = videos.secureUrl; //No read
                // getProblem.cloudnaryPublicId = videos.cloudinaryPublicId;//iesko frontend mn bhejne ki jarurat nahi hn
                // getProblem.thumbnailUrl = videos.thumbnailUrl; //No read
                // getProblem.duration = videos.duration;// No read
                // getProblem mn secureUrl, thumbnailUrl, duration ye sab nahi jaa rahi hn kyoki getProblem ke schema mn ye sab mention hi nahi hn
                // return res.status(200).send(getProblem);//No read

                return res.status(200).send(responseData);
        }
        // 

        res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
};

const getAllProblem = async (req,res)=>{
        try{
                const getProblems = await Problem.find({}).select('_id title difficulty tags');
                if(getProblems.length==0)
                        return res.status(404).send("No any problem exist");
                return res.status(200).send(getProblems);
        }
        catch(error)
        {
                res.status(500).send("Error :"+ error);
        }
}

// pagination
// const getAllProblem = async (req, res) => {
//     try {
//         // Get page and limit from query params, or default to page 1 and limit 10
//         const page = parseInt(req.query.page) || 1;
//         const limit = parseInt(req.query.limit) || 10;

//         const skip = (page - 1) * limit;

//         // Fetch paginated problems
//         const getProblems = await Problem.find().skip(skip).limit(limit);

//         // Count total problems for pagination metadata
//         const total = await Problem.countDocuments();

//         if (getProblems.length === 0)
//             return res.status(404).send("No problems exist");

//         // Return problems with pagination info
//         return res.status(200).json({
//             page,
//             limit,
//             totalPages: Math.ceil(total / limit),
//             totalProblems: total,
//             problems: getProblems
//         });
//     } catch (err) {
//         return res.status(500).send("Error: " + err.message);
//     }
// };

// GET http://localhost:3000/problem/getAllProblem?page=2&limit=5  => api call

// const solvedAllProblemByUser = async (req,res)=>{

// }

 
const solvedAllProblemByUser = async (req,res)=>{
        try{
                const userId = req.result._id;
                const user = await User.findById(userId).populate({
                        path:"problemSolved",
                        select:"_id title difficulty tags"
                });//populate means problemSolved jo bhi objectId hn uska actual data leke aao kyoki schema banate time problem ka ref diya th
                res.status(200).send(user.problemSolved);
        }
        catch(error){
                res.status(500).send("Server Error:"+ error);
        }
}

const submittedProblem = async (req,res)=>{

        try{
                const userId = req.result._id;
                const problemId = req.params.pid;

                const ans = await Submission.find({userId,problemId});

                // if(ans.length==0)
                //         res.status(200).send("No Submission is present");
                // Day-18 update
                if (ans.length === 0) {
                        return res.status(200).send([]); // Send an empty array to avoid frontend errors
                }

                res.status(200).send(ans);
        }
        catch(error){
                res.status(500).send("Internal Server Error");
        }
}

module.exports = {CreateProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem};