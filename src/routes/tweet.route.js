import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";
import {isOwneroftheTweet} from "../middlewares/isOwnerOfContent.middleware.js";
import { createTweet, deleteTweet, getUserTweet, updateTweet } from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/uploadTweet").post(upload.single("tweetImage"),createTweet);
router.route("/userTweets/:userId").get(getUserTweet);
router.route("/updateTweet/:tweetId").patch(upload.single("Image"),updateTweet);
router.route("/deletTweet/:tweetId").delete(isOwneroftheTweet,deleteTweet);

export default router

