import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Subscriptions } from "../models/subscription.model.js";
import { isValidObjectId } from "mongoose";

const subscriptionToggel = asyncHandler(async (req,res) =>{
    const {channelId} = req.params;

    if(!channelId){
        throw new ApiError(400,"channel id is not provided!");
    }

    if(!isValidObjectId(channelId)){
        throw new ApiError(403,"Channel id is not valid");
    }

    const isSameUser = channelId.toString() === req?.user._id.toString();

    if(isSameUser){
        throw new ApiError(100,"you can't subscribed your own");
    }
    const exitssubscription = await Subscriptions.findOne({
        channel:channelId,
        subscriber:req?.user._id
    });

    if(exitssubscription){
        const unsubscribeChannel = await Subscriptions.findByIdAndDelete(exitssubscription?._id);

        if(!unsubscribeChannel){
            throw new ApiError(500,"opps something went wrong!!");
        }
        return res.status(200).json(new ApiResponse({},200,"channel unSubscribed"));
    }
    else{
        const subscribeNewChannel = await Subscriptions.create({
            channel:channelId,
            subscriber:req?.user._id
        });

        const newChannelSubscibedByUser = await Subscriptions.findById(subscribeNewChannel._id);

        if(!newChannelSubscibedByUser){
            throw new ApiError(500,"some thing went wrong while subscribeing the channel");
        }
        return res.status(200).json(new ApiResponse(newChannelSubscibedByUser,200,"subscibed successFully!"))
    }


});
const getUserChannelSubscribed = asyncHandler(async (req,res) =>{
    const {channelId} = req.params;

    if(!channelId){
        throw new ApiError(400,"channel id is not provided!");
    }
    if(!isValidObjectId(channelId)){
        throw new ApiError(403,"channel id is not valid");
    }
    const subscribers = await Subscriptions.find({
        channel:channelId
    });
    if(
        !subscribers
    ){
        throw new ApiError(500,"something went wrong while getting subscibers count");
    }
    console.log("subscribers count:",subscribers.length);

    return res.status(200).json(new ApiResponse(subscribers,200,"subscribers count fetched successfully!!"));
});

const getSubscribedChannel = asyncHandler(async(req,res) =>{
    const {subscriberId} = req.params;

    if(!subscriberId){
        throw new ApiError(400,"subscriberId is not provided!");
    }
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(403,"subsciber id is not vlaid!");
    }
    const channels = await Subscriptions.find({
        subscriber:subscriberId
    });
    if(!channels){
        throw new ApiError(500,"channels are not found");
    }
   console.log("suscribed channel count:",channels.length);

   return res.status(200).json(new ApiResponse(channels,200,"subscibed channels are found"));
});

export {subscriptionToggel,getUserChannelSubscribed,getSubscribedChannel}