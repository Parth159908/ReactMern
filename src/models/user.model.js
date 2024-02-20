import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    userName: {
        type:String,
        requrired:true,
        index:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    email: {
        type:String,
        requrired:true,
        unique:true,
        trim:true,
        lowercase:true
    },
    fullName:{
        type:String,
        requrired:true,
        unique:true,
        trim:true,
        index:true
    },
    avtar:{
        type:String, //Get from third party cloud bucket
        requrired:true,
    },
    coverImage:{
        type:String, //get from third party cloud bucket
    },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    password :{
        type:String,
        requrired:[true,'Password is Requried']
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})

userSchema.pre("save", function (next) {
    const user = this;

    // Only hash the password if it has been modified or is new
    if (!user.isModified("password")) return next();

    // Use bcrypt to hash the password
    bcrypt.hash(user.password, 8, (err, hashedPassword) => {
        if (err) return next(err);

        // Update the user's password with the hashed one
        user.password = hashedPassword;
        next();
    });
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.genrateAccessToken = function (){
   return jwt.sign({
        _id : this._id,
        email:this.email,
        userName:this.userName,
        fullName:this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.genrateRefreshToken = function (){
    return jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIREY
        }
    )
}

export const User = mongoose.model("User",userSchema);