import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    thumbnail : {
        type:String, // get from third party cloud bucket
        reuried:true 
    },
    description : {
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true,
        index:true,
        trim:true
    },
    videoFile:{
        type:String, //get from third party cloud bucket
        required:[true,"Video is required"],

    },
    duration : {
        type:Number, // get from third part bucket
        // required:true
    },
    views :{
        type:Number,
        default:0
    },
    isPublished : {
        type:Boolean,
        // required:true,
        default:true
    },
    owner :{
        type:mongoose.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema);