import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Likes } from "../models/likes.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!videoId) {
        throw new ApiError(400, "video id is not provided");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video is not valid");
    }

    const getExitingLike = await Likes.findOne({
        videos: videoId,
        likedBy: req.user?._id
    });
    if (getExitingLike) {
        await Likes.findByIdAndDelete(getExitingLike?._id);
        return res.status(200).json(new ApiResponse({}, 200, "video removed from the like successfully"));
    } else {
        const like = await Likes.create({
            videos: videoId,
            likedBy: req.user?._id
        });

        if (!like) {
            throw new ApiError(500, "something went wrong!!");
        }

        const likedVideo = await Likes.findById(like?._id);

        if (!likedVideo) {
            throw new ApiError(500, "something went wrong while liked the video!");
        }

        return res.status(200).json(new ApiResponse(likedVideo, 200, "video liked successfully"));
    }

});

const toggleCommentLikes = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId) {
        throw new ApiError(400, "comment is not provided");
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "provide comment is not valid");
    }

    const getexitingLikeinComment = await Likes.findOne({
        comment: commentId,
        likedBy: req.user?._id
    });
    if (getexitingLikeinComment) {
        await Likes.findByIdAndDelete(getexitingLikeinComment?._id);

        return res.status(200).json(new ApiResponse({}, 200, "comment unliked successfully"));
    } else {
        const createCommentLike = await Likes.create({
            comment: commentId,
            likedBy: req.user?._id
        });
        if (!createCommentLike) {
            throw new ApiError(500, "something went wrong!!");
        }

        const likedComment = await Likes.findById(createCommentLike?._id);

        if (!likedComment) {
            throw new ApiError(500, "something went wrong while liked the comment!");
        }

        return res.status(200).json(new ApiResponse(likedComment, 200, "comment liked successfully"));

    }
});
const toggleTweetLikes = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId) {
        throw new ApiError(400, "Tweet is not provided");
    }
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "provide Tweet is not valid");
    }

    const getexitingLikeinTweet = await Likes.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    });
    if (getexitingLikeinTweet) {
        await Likes.findByIdAndDelete(getexitingLikeinTweet?._id);

        return res.status(200).json(new ApiResponse({}, 200, "Tweet unliked successfully"));
    } else {
        const createTweetLike = await Likes.create({
            tweet: tweetId,
            likedBy: req.user?._id
        });
        if (!createTweetLike) {
            throw new ApiError(500, "something went wrong!!");
        }

        const likedTweet = await Likes.findById(createTweetLike?._id);

        if (!likedTweet) {
            throw new ApiError(500, "something went wrong while liked the comment!");
        }

        return res.status(200).json(new ApiResponse(likedTweet, 200, "Tweet liked successfully"));

    }
});
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = 
        await Likes.aggregate([
            {
              $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id) 
              },
            },
            {
              $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "video",
              },
            },
            {
              $unwind: "$video",
            },
            {
              $lookup: {
                from: "likes",
                localField: "video._id",
                foreignField: "videos",
                as: "likes",
              },
            },
            {
              $addFields: {
                likesCount: {
                  $size: "$likes",
                },
              },
            },
            {
              $project: {
                _id: "$video._id",
                title: "$video.title",
                thumbnail: "$video.thumbnail",
                description: "$video.description",
                videoFile: "$video.videoFile",
                duration: "$video.duration",
                views: "$video.views",
                owner: "$video.owner",
                likesCount: "$likesCount",
              },
            },
          ]);

    return res.status(200).json(new ApiResponse(likedVideos, 200, "Liked videos fetched successfully"));
})

export { toggleVideoLike, toggleCommentLikes, toggleTweetLikes, getLikedVideos }