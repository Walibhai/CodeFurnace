const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
        userId:{
                type:Schema.Types.ObjectId,
                ref:'user',
                required:true,
                // index:true
        },
        problemId:{
                type:Schema.Types.ObjectId,
                ref:'problem',
                required:true
        },
        code:{
                type:String,
                required:true
        },
        language:{
                type:String,
                required:true,
                enum:['javascript','c++','java']//Expanded language support
        },
        status:{
                type:String,
                enum:['pending','accepted','wrong','error'],
                default:'pending'
        },
        runtime:{
                type:Number, //miliseconds
                default:0
        },
        memory:{
                type:Number, //KB
                default:0
        },
        errorMessage:{
                type:String,
                default: ''
        },
        testCasesPassed:{ 
                type:Number,
                default:0
        },
        testCasesTotal:{ //Recommeded addition
                type:Number,
                default:0
        }
}, {
        timestamps:true
});

submissionSchema.index({userId:1 , problemId:1});//ab compound index ban gaya

const Submission = mongoose.model('submission',submissionSchema);
module.exports = Submission;
