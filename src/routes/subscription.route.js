import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { subscriptionToggel,getUserChannelSubscribed, getSubscribedChannel } from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router
    .route("/c/:channelId")
    .get(getUserChannelSubscribed)
    .post(subscriptionToggel);

router.route("/u/:subscriberId").get(getSubscribedChannel);

export default router;