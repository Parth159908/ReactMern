import { ApiError } from "../utils/apiErrors.js";
// import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comments } from "../models/comments.model.js";
import { Tweets } from "../models/tweet.model.js";
import { PlayList } from "../models/playList.model.js";
// import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";


const isOwnerOfTheCommentOrOwnerOftheVideo = asyncHandler(async (req, res, next) => {
    try {
        const { videoId, commentId } = req.params;

        if (!(videoId || commentId)) {
            throw new ApiError(400, "videoId and CommentId is not provided");
        }
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "provided video is not valid");
        }
        if (!isValidObjectId(commentId)) {
            throw new ApiError(400, "provided comment is not valid");
        }
        console.log("VideoId:",videoId);
        const video = await Video.findById(videoId);
        console.log("video:",video);


        if (!video) {
            throw new ApiError(500, "something went wrong while found the video");
        }
        const comment = await Comments.findById(commentId);
        if (!comment) {
            throw new ApiError(500, "something went wrong while found the comment");
        }
        console.log("req.user?._id",req.user?._id);
        console.log("comment.owner",comment.owner);
        console.log("video.owner",video.owner);
        if (!comment.owner.equals(req.user?._id) || !video.owner.equals(req.user?._id)) {
            throw new ApiError(403, "You are not aurthrized to delete this comment");
        }

        next();
    } catch (error) {
        throw new ApiError(500, error?.message ? error.message : "something went wrong in middelWare");
    }
});

const isOwnerOftheVideo = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params;

        if (!videoId) {
            throw new ApiError(400, "Video id is not provided");
        }
        if (!isValidObjectId(videoId)) {
            throw new ApiError(400, "provided video is not valid");
        }
        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(500, "something went wrong while found the video");
        }
        if (video.owner !== req.user?._id) {
            throw new ApiError(403, "You are not aurthorized to delete this video")
        }
        next();
    } catch (error) {
        throw new ApiError(500, error?.message ? error.message : "something went wrong in middelWare");
    }
});

const isOwneroftheTweet = asyncHandler(async (req, res, next) => {
    try {
        const { tweetId } = req.params;
        if (!tweetId) {
            throw new ApiError(400, "tweet id is not provided");
        }
        if (!isValidObjectId(tweetId)) {
            throw new ApiError(400, "provided tweet is not valid");
        }

        const tweet = await Tweets.findById(tweetId);
        if (!tweet) {
            throw new ApiError(500, "something went wrong while found the tweet");
        }

        if (tweet.owner !== req.user?._id) {
            throw new ApiError(403, "You are not aurthorized to delete this tweet");
        }

        next();
    } catch (error) {
        throw new ApiError(500, error?.message ? error.message : "something went wrong in middelWare");
    }

});

const isOwnerOfthePlayList = asyncHandler(async (req, res, next) => {
    try {
        const { playListId } = req.params;
        if (!playListId) {
            throw new ApiError(400, "playList id is not provided");
        }
        if (!isValidObjectId(playListId)) {
            throw new ApiError(400, "provided playList is not valid");
        }

        const playList = await PlayList.findById(playListId);
        if (!playList) {
            throw new ApiError(500, "something went wrong while found the playList");
        }

        if (playList.owner !== req.user?._id) {
            throw new ApiError(403, "You are not aurthorized to delete this PlayList");
        }

        next();
    } catch (error) {
        throw new ApiError(500, error?.message ? error.message : "something went wrong in middelWare");
    }
});

export { isOwnerOfTheCommentOrOwnerOftheVideo, isOwnerOftheVideo, isOwneroftheTweet, isOwnerOfthePlayList }
