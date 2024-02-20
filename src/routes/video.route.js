import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideo, getVideoById, publishVideo, updateVideo, videoPublishedStatusToggeld } from "../controllers/video.controller.js";
import { isOwnerOftheVideo } from "../middlewares/isOwnerOfContent.middleware.js";

const router = Router();

router.use(verifyJWT);


router.route("/publisheVideo").post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishVideo
);

router.route("/vid/:videoId").get(getVideoById);
router.route("/updateVideo").patch(upload.single("thumbnail"), updateVideo);
router.route("/deleteVideo/:videoId").delete(isOwnerOftheVideo, deleteVideo);
router.route("/").get(getAllVideo);
router.route("/changeStatusOfVideo/:videoId").patch(videoPublishedStatusToggeld);

export default router;