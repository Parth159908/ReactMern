import mongoose,{Schema} from "mongoose";

const tweetSchema = new Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
    },
    contentDescription: {
        type: String,
        required: true,
    },
    tweetImage:{
        type:String
    }
},{timestamps:true});

export const Tweets = mongoose.model("Tweets",tweetSchema);