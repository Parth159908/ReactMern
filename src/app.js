import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from 'cors';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGINE,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import 
import userRouter from './routes/user.route.js';
import videoRouter from "./routes/video.route.js";
import tweetRouter from "./routes/tweet.route.js";
import subscriptionRouter from "./routes/subscription.route.js";
import playListrouter from "./routes/playList.route.js";
import commentsRouter from "./routes/comments.route.js";
import healthCheckRouter from "./routes/healthCheck.route.js";
import likeRouter from "./routes/likes.route.js";
import dashbordRouter from "./routes/dashbord.route.js";

//routes Declration
app.use("/api/users",userRouter);
app.use("/api/videos",videoRouter);
app.use("/api/tweets",tweetRouter);
app.use("/api/subscription",subscriptionRouter);
app.use("/api/PlayList",playListrouter);
app.use("/api/comments",commentsRouter);
app.use("/api/healthCheck",healthCheckRouter);
app.use("/api/likes",likeRouter);
app.use("/api/dashbord",dashbordRouter);


export default app;