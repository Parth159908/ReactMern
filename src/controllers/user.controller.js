import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
// import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
// import assert from "node:assert";
// import { getEncoding,encodingForModel, } from "js-tiktoken";
import openaiTokenCounter from 'openai-gpt-token-counter';


const genrateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.genrateAccessToken();
        const refreshToken = user.genrateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while genrating access and refresh token!!")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message:"User Register successfully"
    // })
    const { userName, fullName, email, password } = req.body
    if (userName === "") {
        throw new ApiError(400, "userName is requried");
    }
    else if (fullName === "") {
        throw new ApiError(400, "fullName is requried");
    }
    else if (password === "") {
        throw new ApiError(400, "password is requried");
    }
    else if (email === "") {
        throw new ApiError(400, "email is requried");
    }

    const userExits = await User.findOne({
        $or: [{ userName }, { email }]
    });


    if (userExits) {
        throw new ApiError(409, "UserName or Email is already exits");
    }
    const avatarLocalPath = req.files?.avtar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avtar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()

    });
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(201).json(
        new ApiResponse(createdUser, 200, "User Register successfully")
    );


});
const logInUser = asyncHandler(async (req, res) => {
    const { userName, email, password } = req.body;
    if (!(userName || email)) {
        throw new ApiError(400, "UserName or Email is requrierd");
    }
    const user = await User.findOne(
        {
            $or: [{ userName }, { email }]
        }
    )
    if (!user) {
        throw new ApiError(404, "User Dose note exits");
    }
    const isPasswordvalid = await user.isPasswordCorrect(password)
    if (!isPasswordvalid) {
        throw new ApiError(401, "Invalid Crediatals");
    }
    const { accessToken, refreshToken } = await genrateAccessTokenAndRefreshToken(user._id);
    const logdInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse({ user: logdInUser, accessToken, refreshToken }, 200, "User logdIn successfully!")
    )

})
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset:{
                refreshToken:1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse({}, 200, "User Logouted successfully!!"))

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingToken) {
        throw new ApiError(401, "Unaurthorized request")
    }

    try {
        const decodedToken = await jwt.verify(incomingToken, process.env.REFRRESH_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid Acesstoken");
        }

        if (incomingToken !== user?.refreshToken) {
            throw new ApiError(403, "Refresh Token is Expired or in Used");
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = await genrateAccessTokenAndRefreshToken(user._id);

        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newRefreshToken, options).json(
            new ApiResponse(
                {
                    accessToken, refreshToken: newRefreshToken
                }, 200, "new AccessToken genrated! "
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Something went wrong while genrating New Accesstoken");
    }
});

const changeUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confPassword } = req.body;

    if (!(newPassword === confPassword)) {
        throw new ApiError(400, "New Password and Confirm Password should be same!");
    }

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid password");
    }
    user.password = newPassword;
    await user.save({ validateBeforSave: false });

    return res.status(200).json(
        new ApiResponse(
            {}, 200, "Password updated successfully!"
        )
    )
});

const getCurrentUser = asyncHandler(async (req, res) => {
    const userInfo = await User.findById(req.user?._id).select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(userInfo, 200, "Current user fetched successfully"))
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!(fullName || email)) {
        throw new ApiError(400, "All field are requried");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id, {
        $set: {
            fullName: fullName,
            email: email
        }
    }, { new: true }
    ).select("-password")
    return res.status(200).json(new ApiResponse(user, 200, "User Account updated successfully!"));
});

const updateUserAvtar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please attached new Avtar")
    }
    const avtar = await uploadOnCloudinary(avatarLocalPath);

    if (!avtar?.url) {
        throw new ApiError(500, "Something went wrong while uploding image on bucket");
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            avtar: avtar?.url
        }
    }, { new: true }).select("-password");

    return res.status(200).json(new ApiResponse(
        user, 200, "Avtar is updated successfully"
    ));
})
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalePath = req.file?.path

    if (!coverImageLocalePath) {
        throw new ApiError(400, "Please attached the new cover Iamge!!")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalePath);

    if (!coverImage?.url) {
        throw new ApiError(500, "something went wrong while updating coverimage");
    }
    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            coverImage: coverImage?.url
        }
    }, { new: true }).select("-password");

    return res.status(200).json(new ApiResponse(
        user, 200, "CoverImage updated successFully"
    ));
});

const userChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params;

    if (!userName?.trim()) {
        throw new ApiError(400, "UserName is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscibed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                email: 1,
                userName: 1,
                avtar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscibed: 1,
                createdAt: 1,
                updatedAt: 1

            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(404, "Channel dose not exits");
    }
    return res.status(200)
        .json(
            new ApiResponse(channel[0], 200, "user channel fetched successfully!!")
        )
});

const watchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {_id:new mongoose.Types.ObjectId(req.user?._id)}
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "userWatchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        userName: 1,
                                        avtar: 1,
                                        fullName: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        }
    ]);
    // if (!user[0].userWatchHistory.length) {
    //     throw new ApiError(500,"Something went wrong while fetching watchHistory");
    // }

    return res.status(200).json( new ApiResponse(user[0]?.userWatchHistory,200,"Watch history fetched succeessfully"));
});

const getTokenCount = asyncHandler(async (req,res) =>{
    const {propmt,modelName} = req.body;
    console.log("Requsted Body:",req.body);

    if(!(propmt || modelName)){
        throw new ApiError(400,"Please enter the prompt and modelName");
    }
    const tokenCounts = openaiTokenCounter.text(propmt,modelName);
    console.log(`Token count: ${tokenCounts}`);

    if(!tokenCounts){
        throw new ApiError(500,"something went wrong while count the tokens!");
    }

    return res.status(200).json(new ApiResponse(tokenCounts,200,"token counted successfully"));
    


});

export { registerUser, logInUser, logoutUser, refreshAccessToken, changeUserPassword, getCurrentUser, updateAccountDetails, updateUserAvtar, updateUserCoverImage, userChannelProfile, watchHistory,getTokenCount }