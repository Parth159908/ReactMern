import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiErrors.js";
import { isValidObjectId } from "mongoose";
import { Comments } from "../models/comments.model.js";

const addComment = asyncHandler(async (req, res) => {
    const { videoId, comment, userId } = req.body;

    if (!(videoId || comment || userId)) {
        throw new ApiError(400, "user and Video are requried");
    }
    if (!(isValidObjectId(videoId))) {
        throw new ApiError(400, "Provided video is not found");
    }
    if (!(isValidObjectId(userId))) {
        throw new ApiError(400, "Provided user is not validate");
    }
    const addedComment = await Comments.create({
        video: videoId,
        owner: userId,
        content: comment
    });

    if (!addedComment) {
        throw new ApiError(500, "something went wrong while adding the comment!");
    }

    return res.status(200).json(new ApiResponse(addedComment, 200, "comment posted successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;

    if (!(commentId)) {
        throw new ApiError(400, "comment is not found");
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "provided comment is not valid");
    }

    const updatedComment = await Comments.findByIdAndUpdate(commentId, {
        content: comment
    }, { new: true });

    if (!updatedComment) {
        throw new ApiError(500, "something went wrong while udating comment please retry after sometime!");
    }

    return res.status(200).json(new ApiResponse(updatedComment, 200, "comment is updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!(commentId)) {
        throw new ApiError(400, "comment is not found");
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "provided comment is not valid");
    }

    const deletedComment = await Comments.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(500, "something went wrong while delete the comment!");
    }

    return res.status(200).json(new ApiResponse(deletedComment, 200, "comment is deleted successfully"));

});

const getVideoComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    const {page=1,pageSize=10} = req.query;

    if(!videoId){
        throw new ApiError(400,"Video id is requried");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiResponse(400,"video is not vlaid");
    }
    const getCommentofVideo = await Comments.find({
        video:videoId
    }).skip((page-1)*pageSize).limit(pageSize);

    if (!getCommentofVideo) {
        throw new ApiError(500,"Something went wrong while loading the comments!");
    }

    return res.status(200).json(new ApiResponse(getCommentofVideo,200,"comments are fetched successfully"));
});

export { addComment, updateComment, deleteComment, getVideoComment }