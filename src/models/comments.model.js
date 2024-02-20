import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video', 
        // required: true,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        // required: true,
    },
    content: {
        type: String,
        required: true,
    },
},{timestamps:true});

commentSchema.plugin(mongooseAggregatePaginate);

export const Comments = mongoose.model("Comments",commentSchema);