const cloudinary = require('cloudinary').v2;
const Problem = require("../models/problem");
const User = require("../models/user");
const SolutionVideo = require("../models/solutionVideo");
const { sanitizeFilter } = require('mongoose');


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    const userId = req.result._id;
    // Verify problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Generate unique public_id for the video
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;
    
    // Upload parameters
    const uploadParams = {
      timestamp: timestamp,
      public_id: publicId,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      signature,
      timestamp,
      public_id: publicId,
      api_key: process.env.CLOUDINARY_API_KEY,//iesko bhej rahe taki correspondence api_secret find out karne ke liye
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`,
    });

  } catch (error) {
    console.error('Error generating upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }
};


const saveVideoMetadata = async (req, res) => {
  try {
    const {
      problemId,
      cloudinaryPublicId,
      secureUrl,
      duration,
    } = req.body;

    const userId = req.result._id;//admin middleware se rakha gaya hoga

    // Verify the upload with Cloudinary (Backend check karega ki frontend sahi se Cloudinary pe data store kara hn ki nahi => agar ies cloudinaryPublicId ka data cloudinary mn mil gaya to saari information backend ko bhej dega)
    const cloudinaryResource = await cloudinary.api.resource(
      cloudinaryPublicId,
      { resource_type: 'video' }
    );

    if (!cloudinaryResource) {//agar present nahi hua cloudinary mn to null ya undefined aayega
      return res.status(400).json({ error: 'Video not found on Cloudinary' });
    }

    // Check if video already exists for this problem and user
    const existingVideo = await SolutionVideo.findOne({
      problemId,
      userId,
      cloudinaryPublicId
    });

    if (existingVideo) {
      return res.status(409).json({ error: 'Video already exists' });
    }

//     same isi tarah aap video ke liye bhi URL create kar sakte hn
// ies se thumbnail create nahi ho raha th
    // const thumbnailUrl = cloudinary.url(cloudinaryResource.public_id, {//cloudinaryResouce mn public id hoga //=> url mil jaayega and usme cloud_name find karne ke liye configuarion pahle hi kar chuke hn
    // resource_type: 'image',  
    // transformation: [
    // { width: 400, height: 225, crop: 'fill' },
    // { quality: 'auto' },
    // { start_offset: 'auto' }  
    // ],
    // format: 'jpg'
    // });

    // Home work
    const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id,{resource_type: "video"});//ies se video ka thumbnail create ho jaayega

    // https://cloudinary.com/documentation/video_effects_and_enhancements#video_thumbnails ( ye search karke dekh sakte ho ki thumbnail kaise banaye)

    // Create video solution record
    const videoSolution = await SolutionVideo.create({
      problemId,
      userId,
      cloudinaryPublicId,
      secureUrl,
      duration: cloudinaryResource.duration || duration,
      thumbnailUrl
    });


    res.status(201).json({
      message: 'Video solution saved successfully',
      videoSolution: {
        id: videoSolution._id,
        thumbnailUrl: videoSolution.thumbnailUrl,
        duration: videoSolution.duration,
        uploadedAt: videoSolution.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    res.status(500).json({ error: 'Failed to save video metadata' });
  }
};


const deleteVideo = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.result._id;

    const video = await SolutionVideo.findOneAndDelete({problemId:problemId});//agar present hue to delete hone ke baad saari information video varible mn aa jayegi
    
   

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: 'video' , invalidate: true });//ab cloudinary se bhi delete ho jaayegi
                                                                       // invalidate: true =>means  It tells Cloudinary to invalidate (remove) the cached copy from all their CDN servers.

    res.json({ message: 'Video deleted successfully' });

  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

module.exports = {generateUploadSignature,saveVideoMetadata,deleteVideo};