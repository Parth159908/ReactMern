import mongoose,{Schema} from "mongoose";

const likesSchema = new Schema({
    videos : 
        {
            type:mongoose.Types.ObjectId,
            ref:"Video",
            // required:true
        }
    ,
    comment : 
        {
            type:mongoose.Types.ObjectId,
            ref:"Comments"
        }
    ,
    tweet : {
        type:mongoose.Types.ObjectId,
        ref:"Tweets"
    },
    likedBy : {
        type:mongoose.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true});

export const Likes = mongoose.model('Likes',likesSchema)