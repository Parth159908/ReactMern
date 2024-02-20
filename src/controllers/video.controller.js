import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary,deletItemFromCloud,deletVideoFromCloud } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { extractPublicId } from "cloudinary-build-url";
import { isValidObjectId } from "mongoose";


const publishVideo = asyncHandler(async (req,res) =>{
    const {title,description} = req.body;

    if(title === ""){
        throw new ApiError(400,"All fields are requried");
    }
    if(description === ""){
        throw new ApiError(400,"All fields are requierd");
    }
    // console.log("Request",req.files);
    const videoLocalPath = req.files?.video[0]?.path;
    // console.log("videoLocalPath",videoLocalPath);
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    // console.log("thumbnailLocalPath",videoLocalPath);

    if (!(videoLocalPath || thumbnailLocalPath)) {
        throw new ApiError(400,"Video and thumbnail is requried");
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    // console.log("Video file url on cloudnery:",video?.url);
    // console.log("thumbnail file url on clodnery:",thumbnail?.url);
    // console.log("duration of video:",video?.duration);

    if(!(video || thumbnail)){
        throw new ApiError(500,"Something went wrong while uploading video and thumbnail!");
    }
    const duration = video?.duration;

    // const addVideoinDB = await Video.create({

    // })

    const addVideoinDB = await Video.create({
        thumbnail:thumbnail?.url,
        description:description,
        title:title,
        videoFile:video?.url,
        duration:duration,
        owner:req.user?._id
    });

    if(!addVideoinDB){
        throw new ApiError(500,"something went wrong while uploding the video in db");
    }

    const uploadedVideo = await Video.findById(addVideoinDB?._id);

    return res.status(200).json(new ApiResponse(uploadedVideo,200,"Video has been uploaded successfully!!"))

});

const getVideoById = asyncHandler(async (req,res) =>{
    const {videoId} = req?.params;

    if(!videoId){
        throw new ApiError(400,"video url is incoorect");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(500,"can't find requested video");
    }

    return res.status(200).json(new ApiResponse(
        video,200,"video fetched successfully"
    ));

});

const updateVideo = asyncHandler(async (req,res) =>{
    const {videoId,title,description} = req.body;

    if (!videoId) {
        throw new ApiError(400,"Video Id is must");
    }
    const thumbnailLocalePath = req.file?.path;

    const updatedThumbnail = await uploadOnCloudinary(thumbnailLocalePath);

    const oldVideo = await Video.findById(videoId);

    if (!oldVideo) {
        throw new ApiError(400,"video not found");
    }
    const oldVideoPublicId = extractPublicId(oldVideo?.thumbnail);
    const deleteItme = await deletItemFromCloud(oldVideoPublicId);

    if (!deleteItme) {
        throw new ApiError(500,"error while deleting the item!");
    }
    console.log(deleteItme);
    if(!updatedThumbnail){
        throw new ApiError(500,"something went wrong while uploade thumbnail");
    }
    const video = await Video.findByIdAndUpdate(videoId,{
        $set:{
            title: title? title:Video.title,
            description:description? description : Video.description,
            thumbnail:updatedThumbnail?.url
        }
    },{new:true})

    if(!video){
        throw new ApiError(500,"something went wrong while updating details");
    }

    return res.status(200).json(new ApiResponse(
        video,200,"Video details are updated successfully"
    ))
});

const deleteVideo = asyncHandler(async (req,res) =>{
    console.log("req.prams",req.params);
    const {videoId} = req?.params;

    if(!videoId){
        throw new ApiError(400,"VideoId is not Provided");
    }
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400,"video is not found");
    }
    const deltedVideoObject = await Video.findById(videoId);
    console.log("deletedVideo",deltedVideoObject);

    if(!deltedVideoObject){
        throw new ApiError(500,"Video not found");
    }

    const deletedVideoThumbnailpId = await extractPublicId(deltedVideoObject?.thumbnail);
    const deletethumbnailfromCloudinary = await deletItemFromCloud(deletedVideoThumbnailpId);
    
    if (!deletethumbnailfromCloudinary) {
        throw new ApiError(500,"something went wrong while deleting thumbnail from cloudinary");
    }
    const dletedVideoPID = await extractPublicId(deltedVideoObject?.videoFile);
    const cloudDeleteVideo = await deletVideoFromCloud(dletedVideoPID);

    if (!cloudDeleteVideo) {
        throw new ApiError(500,"something went wrong while delete the video from cloud");
    }
    const deleteOpration = await Video.findByIdAndDelete(videoId);

    if (!deleteOpration) {
        throw new ApiError(500,"something went wrong while deleting video");
    }

    return res.status(200).json(new ApiResponse({},200,"Video deleted successfully!!"));
})

const getAllVideo = asyncHandler(async (req,res) =>{ 
    const {page,limit,userId,sortBy,sortType,query} = req.body;

    let videoQuery = {};

    // Apply filters based on the request parameters
    if (query) {
      videoQuery = { ...videoQuery, title: new RegExp(query, "i") };
    }
  
    if (userId) {
      if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId format");
      }
      videoQuery = { ...videoQuery, owner: userId };
    }
  
    // Get the total count of videos matching the query
    const totalVideos = await Video.countDocuments(videoQuery);
    // Apply sorting based on sortBy and sortType
    let sortCriteria = {};
    if (sortBy) {
      sortCriteria[sortBy] = sortType === "desc" ? -1 : 1;
    }
  
    // Retrieve videos based on pagination, query, and sort
    const videos = await Video.find(videoQuery)
      .sort(sortCriteria)
      .skip((page - 1) * limit)
      .limit(Number(limit));
  
    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos Fetched Successfully"));
  
});
const videoPublishedStatusToggeld = asyncHandler(async (req,res) =>{
    const {videoId} = req.params;

    if(!videoId.trim()){
        throw new ApiError(400,"video id is not provided");
    }
    const toggledVideo = await Video.findById(videoId);
    console.log("toggledVideo",toggledVideo);
    toggledVideo.isPublished = !toggledVideo.isPublished;

    const stausChanged = await toggledVideo.save();
    console.log("stausChanged",stausChanged);

    return res.status(200).json(new ApiResponse(toggledVideo,200,"video is find "));
});
export {publishVideo,getVideoById,updateVideo,deleteVideo,getAllVideo,videoPublishedStatusToggeld}