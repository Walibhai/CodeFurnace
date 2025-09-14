const mongoose = require('mongoose');
const {Schema} = mongoose;

const videoSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: 'problem',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
   },
   cloudinaryPublicId: {
        type: String,
        required: true,
        unique: true
  },
//   cloudinaryUrl:{ //http wala
//         type:String,
//         required:true
//   },
  secureUrl: {//https wala  => in dono ko store na bhi karaye to bhi mera only cloudinaryPublicId se kaam chal jaayega
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number,
    required: true
  },
},{
    timestamps:true
});



const SolutionVideo = mongoose.model("solutionVideo",videoSchema);

module.exports = SolutionVideo;
