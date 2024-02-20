import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiErrors.js";
import { Tweets } from "../models/tweet.model.js";
import { uploadOnCloudinary, deletItemFromCloud } from "../utils/cloudinary.js";
import { extractPublicId } from "cloudinary-build-url";


const createTweet = asyncHandler(async (req, res) => {
    const { description, userId } = req.body;

    if (!(description || userId)) {
        throw new ApiError(400, "Description and userId are requried!!");
    }
    console.log("req.file?.path", req.file?.path);
    const imageLocalePath = req.file?.path;
    if (imageLocalePath) {
        const uploadedImage = await uploadOnCloudinary(imageLocalePath);

        if (!uploadedImage) {
            throw new ApiError(500, "Error while uploding the tweet image on cloudinary");
        }
        if (!uploadedImage?.url) {
            throw new ApiError(500, "Image url from cloud is not found!");
        }
        const newTweet = await Tweets.create({
            owner: userId,
            contentDescription: description,
            tweetImage: uploadedImage?.url
        })

        if (!newTweet) {
            throw new ApiError(500, "something went wrong while post the tweet");
        }

        const createdTweet = await Tweets.findById(newTweet?._id);

        return res.status(200).json(new ApiResponse(createdTweet, 200, "Tweet Posted successfully!"))

    } else {
        const newTweet = await Tweets.create({
            owner: userId,
            contentDescription: description,
        })

        if (!newTweet) {
            throw new ApiError(500, "something went wrong while post the tweet");
        }

        const createdTweet = await Tweets.findById(newTweet?._id);

        return res.status(200).json(new ApiResponse(createdTweet, 200, "Tweet Posted successfully!"))
    }
});

const getUserTweet = asyncHandler(async (req, res) => {
    console.log("requested user:",req.user);
    const { userId } = req?.params;

    if (!userId) {
        throw new ApiError(400, "User ID is Not provided!");
    }
    const tweets = await Tweets.find({ owner: userId });

    console.log("Tweets", tweets);
    if (!tweets) {
        throw new ApiError(404, "User Tweets are not found");
    }
    return res.status(200).json(new ApiResponse(tweets, 200, tweets.length>0?"User Tweets are found successfully!":"No tweets are posted from user!"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { description } = req.body;
    const { tweetId } = req?.params;
    console.log("description", description);
    console.log("tweetId", tweetId);

    if (!tweetId) {
        throw new ApiError(400, "tweet is is not provided");
    }
    const updatedImageLocalPath = req.file?.path;

    if (updatedImageLocalPath) {
        const updateImage = await uploadOnCloudinary(updatedImageLocalPath);
        if (!updateImage?.url) {
            throw new ApiError(500, "something went wrong while uploadeing on cloud!!");
        }
        const oldTweet = await Tweets.findById(tweetId);
        console.log("oldTweet", oldTweet);
        if (!oldTweet) {
            throw new ApiError(500, "something went wrong!");
        }
        if (oldTweet?.tweetImage) {
            const pId = extractPublicId(oldTweet?.tweetImage);
            const deleteOldImageFromCloud = await deletItemFromCloud(pId);

            if (!deleteOldImageFromCloud) {
                throw new ApiError(500, "something went wrong while deleting old image from the cloude!");
            }
        }
        const updatedTweet = await Tweets.findByIdAndUpdate(tweetId, {
            $set: {
                contentDescription: description,
                tweetImage: updateImage?.url,
            }
        }, { new: true });
        console.log("updatedTweet", updatedTweet);
        if (!updatedTweet) {
            throw new ApiError(500, "somnething went wrong while updating tweet!");
        }


        return res.status(200).json(new ApiResponse(updatedTweet, 200, "Tweet updated successfully!"));
    }
    else {
        const updatetweet = await Tweets.findByIdAndUpdate(tweetId, {
            $set: {
                contentDescription: description
            }
        }, { new: true });
        if (!updateTweet) {
            throw new ApiError(500, "something went wronf while updating tweet!");
        }
        return res.status(200).json(new ApiResponse(updatetweet, 200, "Tweet updated successfully!"));
    }


});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req?.params;

    if (!tweetId) {
        throw new ApiError(400, "TweetId is not provided!");
    }

    const tweetTobDelete = await Tweets.findById(tweetId);

    if (!tweetTobDelete) {
        throw new ApiError(404, "Tweet is not found!");
    }
    if (tweetTobDelete?.tweetImage) {
        const pId = extractPublicId(tweetTobDelete?.tweetImage);
        const deleteImageFromCloud = await deletItemFromCloud(pId);

        if (!deletItemFromCloud) {
            throw new ApiError(500, "something went wrong while delete Image from cloud");
        }
        const deleteTweetsfromdb = await Tweets.findByIdAndDelete(tweetId);
        if (!deleteTweetsfromdb) {
            throw new ApiError(500, "something went wrong while delete the tweet!");
        }
        return res.status(200).json(new ApiResponse({}, 200, "Tweet deleted successfully!"))
    } else {
        const deletTweetfromdb = await Tweets.findByIdAndDelete(tweetId);

        if (!deletTweetfromdb) {
            throw new ApiError(500, "something went wrong while delete the tweet!");
        }
        return res.status(200).json(new ApiResponse({}, 200, "Tweet deleted successfully!"))
    }
});

export { createTweet, getUserTweet, updateTweet, deleteTweet }