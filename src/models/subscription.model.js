import mongoose,{Schema} from "mongoose";

const subscriptionsSchema = new Schema({
    subscriber:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        // required:true
    },
    channel:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        // required:true
    }
},{timestamps:true});

export const Subscriptions = mongoose.model("Subscriptions",subscriptionsSchema);