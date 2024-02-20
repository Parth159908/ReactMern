import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiErrors.js";
import { Video } from "../models/video.model.js";
import { Subscriptions } from "../models/subscription.model.js";
import mongoose from "mongoose";
import { Likes } from "../models/likes.model.js";


const getChannelStats = asyncHandler(async (req, res) => {
    const totalViews = await Video.aggregate([
        {
            $match: {owner:new mongoose.Types.ObjectId(req.user?._id)}
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ]);

    const totalSubscribers = await Subscriptions.countDocuments({ channel: req.user?._id });
    const totalVideos = await Video.countDocuments({ owner: req.user?._id });
    const totalLike = await Likes.countDocuments({ video: { $in: await Video.find({ owner: req.user._id }, "_id") } });

    const channelState = { totalViews, totalSubscribers, totalVideos, totalLike }

    return res.status(200).json(new ApiResponse(channelState, 200, "chanels data fetched successfully!!"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelVideos = await Video.find({
        owner: req.user?._id
    });

    if (!channelVideos) {
        throw new ApiError("something went wrong while getting channel video");
    }

    return res.status(200).json(new ApiResponse(channelVideos, 200, "channel videos are fetched successfully!!"));
});

export { getChannelStats, getChannelVideos }