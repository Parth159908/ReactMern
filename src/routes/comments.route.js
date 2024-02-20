import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isOwnerOfTheCommentOrOwnerOftheVideo } from "../middlewares/isOwnerOfContent.middleware.js";
import { addComment, deleteComment, getVideoComment, updateComment } from "../controllers/comment.controller.js";


const router = Router();

router.use(verifyJWT);

router.route("/getVideoComments/:videoId").get(getVideoComment);
router.route("/addcomment").post(addComment);
router.route("/updateComment/:commentId").patch(updateComment);
router.route("/deleteComment/:videoId/:commentId").delete(isOwnerOfTheCommentOrOwnerOftheVideo,deleteComment); 

export default router;