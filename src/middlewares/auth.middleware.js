import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"



const verifyJWT = asyncHandler(async(req,res,next) =>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if (!token) {
            throw new ApiError(401,"unAurthrized request");
        }
    
        const decodeToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodeToken?._id);
    
        if(!user){
            throw new ApiError(403,"Invalid AccessToken!!")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(400,"Invalid AccessToken!!")
    }


})

export {verifyJWT}