import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playList.model.js";
import { Video } from "../models/video.model.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Please get your playlist's name");
    }
    if (!req.user?._id) {
        throw new ApiError(400, "To create a playlist please login your account");
    }

    const playlist = await PlayList.create({
        owner: req.user?._id,
        name: name,
        description: description
    });

    if (!playlist) {
        throw new ApiError(500, "something went wrong while creating playlist");
    }

    return res.status(200).json(new ApiResponse(playlist, 200, "PlayList created successfully!"))

});

const getPlayListByuserId = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "User id is not provided");
    }
    if (!isValidObjectId(userId)) {
        throw new ApiError(403, "Provided user id is not valid");
    }
    const userPlayList = await PlayList.find({
        owner: userId
    });
    if (!userPlayList) {
        throw new ApiError(500, "something went wrong while fetching user's playList");
    }
    return res.status(200).json(new ApiResponse(userPlayList, 200, "user playlist's fetched successfully!"));
});

const getPlaylistbyId = asyncHandler(async (req, res) => {
    const { playListId } = req.params;
    if (!playListId) {
        throw new ApiError(400, "Play list is not provided");
    }
    if (!isValidObjectId(playListId)) {
        throw new ApiError(400, "provided playList is not valid");
    }
    const playList = await PlayList.findById(playListId);

    if (!playList) {
        throw new ApiError(500, "something went wrong while fetching playlist!");
    }
    if (playList.videos.length > 0) {

        const videoList = playList.videos;

        const videoPromise = videoList.map(async (id) => {
            const video = await Video.findById(id);

            if (!video) {
                throw new ApiError(500, `Something went wrong while fetching video ${id}`);
            }

            return video;
        });
        const videoData = await Promise.all(videoPromise);
        const apiResponse = {
            playListInformation: playList,
            videosData: videoData
        }
        return res.status(200).json(new ApiResponse(apiResponse, 200, "PlayList fetched successfully!"));

    } else {
        const apiResponse = {
            playListInformation: playList,
            videosData: null
        }
        return res.status(200).json(new ApiResponse(apiResponse, 200, "PlayList fetched successfully!"));
    }
});

const addVideoToPlayList = asyncHandler(async (req, res) => {
    const { videoId, playListId } = req.body;
    if (!(videoId || playListId)) {
        throw new ApiError(400, "video and playList is not provided!");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Provided video id is not vlaid!");
    }
    if (!isValidObjectId(playListId)) {
        throw new ApiError(400, "Provided playList is not valid!");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Provided video is not valid!");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(500, "something went wrong while video fetched");
    }
    const playlist = await PlayList.findById(playListId);
    if (!playlist) {
        throw new ApiError(500, "something went wrong while playList fetched");
    }
    playlist.videos.push(videoId)

    const newPlaylistwithVideo = await playlist.save({ validateBeforeSave: false });
    if (!newPlaylistwithVideo) {
        throw new ApiError(500, "something went wrong while add the video in playList!");
    }
    return res.status(200).json(new ApiResponse(newPlaylistwithVideo, 200, "Video Added successFully in playList"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playListId } = req.body;

    if (!(videoId || playListId)) {
        throw new ApiError(400, "video id and playlist id is not provided");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "provided video id is not valid");
    }
    if (!isValidObjectId(playListId)) {
        throw new ApiError(400, "provided playList is is not vlaid");
    }

    const removedVideo = await PlayList.findByIdAndUpdate(playListId, {
        $pull: { videos: videoId }
    }, { new: true });
    return res.status(200).json(new ApiResponse(removedVideo, 200, "Video removed from the playList"));
});

const deletePlayList = asyncHandler(async (req, res) => {
    const { playListId } = req.params;

    if (!playListId) {
        throw new ApiError(400, "play list is not provided for the delete");
    }
    if (!isValidObjectId(playListId)) {
        throw new ApiError(400, "Provided play list is not valid");
    }
    const deletedPlayList = await PlayList.findByIdAndDelete(playListId);

    if (!deletedPlayList) {
        throw new ApiError(500, "something went wrong while deleting the playList");
    }

    return res.status(200).json(new ApiResponse({}, 200, "playList deleted successfully!!"));
});
const updatePlayList = asyncHandler(async (req, res) => {
    const { playListId } = req.params;
    const { name, des } = req.body;

    if (!(playListId)) {
        throw new ApiError(400, "Playlist is not provided for the update");
    }
    if (!isValidObjectId(playListId)) {
        throw new ApiError(400, "provided playList is not valid");
    }

    const updatedPlayList = await PlayList.findByIdAndUpdate(playListId, {
        name: name,
        description: des
    }, { new: true });

    if (!updatedPlayList) {
        throw new ApiError(500, "something went wrong while update the playList");
    }

    return res.status(200).json(new ApiResponse(updatedPlayList, 200, "Play list updated successfully"));
})


export { createPlaylist, getPlayListByuserId, getPlaylistbyId, addVideoToPlayList, removeVideoFromPlaylist, deletePlayList, updatePlayList }