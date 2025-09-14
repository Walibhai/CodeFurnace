const mongoose= require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  firstName:{
        type:String,
        required:true,
        minLength:3,
        maxLength:25
  },
  lastName:{
        type:String,
        minLength:3,
        maxLength:25 
  },
  emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true,
  },
  age:{
        type:Number,
        min:6,
        max:80,
  },
  role:{
        type: String,
        enum: ['user', 'admin'],  // ✅ Only these values allowed
        default: 'user',          // ✅ Optional default value
  },
  problemSolved:{
        type:[{
            type:Schema.Types.ObjectId,
            ref:'problem',
            // unique:true (confusion)
        }],
        unique:true //=> api level pe validation kar hi raha hu
  },
  password:{
      type:String,
      required:true
  }
},{timestamps:true});

// niche wala function only ek condition pe chalega jaha findOneAndDelete kara gaya ho ( deleteProfile)
userSchema.post('findOneAndDelete', async function (userInfo){
      if(userInfo){
            await mongoose.model('submission').deleteMany({userId:userInfo._id});
      }
})

const User = mongoose.model("user",userSchema);
module.exports = User;