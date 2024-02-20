import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashbord.controller.js";


const router = Router();

router.use(verifyJWT);

router.route("/channelState").get(getChannelStats);
router.route("/channelVideos").get(getChannelVideos);

export default router