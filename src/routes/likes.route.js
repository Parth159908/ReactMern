import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLikes, toggleTweetLikes, toggleVideoLike } from "../controllers/like.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/videoLike/:videoId").post(toggleVideoLike);
router.route("/commentLike/:commentId").post(toggleCommentLikes);
router.route("/tweetLike/:tweetId").post(toggleTweetLikes);
router.route("/likedVideosByUser").get(getLikedVideos);

export default router;