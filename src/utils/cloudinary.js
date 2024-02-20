import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
import { ApiError } from './apiErrors.js';
          
// console.log("process.env.CLOUDINARY_API_KEY",process.env.CLOUDINARY_API_KEY);
// console.log("Port:",process.env.PORT);
// import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'vidioapp', 
  api_key: 'YOUR_KEV', 
  api_secret: 'YOUR SECREATE KEY' 
});

const uploadOnCloudinary = async (filePath) => {
    // console.log("filePath:",filePath);
    try {
        if(!filePath) return null;

        //Upload procees in cloudinary
        const response = await cloudinary.uploader.upload(filePath,{
            resource_type: "auto"
        });
        //sucess message
        console.log("File is successfully uploadeed on bucket!!");
        fs.unlinkSync(filePath)

        return response

    } catch (error) {
        console.log("error while upload on cloudiery:",error)
        fs.unlinkSync(filePath) // remove the locally stored temporary file as upload processes is failed
        
        return null
    }
}

const deletItemFromCloud = async (publicId) =>{
    try {
        if (!publicId) {
            throw new ApiError(500,"something went wrong while deleting the item");
        }
    
        const deletResponse = await cloudinary.uploader.destroy(publicId,{
            resource_type:"image",
        });
        console.log("item or old item is deleted from the cloud");
    
        return deletResponse
    } catch (error) {
        console.log("error is accured while deleting file:",error);
    }
}
const deletVideoFromCloud = async (publicId) =>{
    try {
        if (!publicId) {
            throw new ApiError(500,"something went wrong while deleting the item");
        }
    
        const deletResponse = await cloudinary.uploader.destroy(publicId,{
            resource_type:"video",
        });
        console.log("item or old item is deleted from the cloud");
    
        return deletResponse
    } catch (error) {
        console.log("error is accured while deleting file:",error);
    }
}

export {uploadOnCloudinary,deletItemFromCloud,deletVideoFromCloud}