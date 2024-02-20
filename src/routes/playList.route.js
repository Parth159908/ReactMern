import { Router } from "express";
import { addVideoToPlayList, createPlaylist, deletePlayList, getPlayListByuserId, getPlaylistbyId, removeVideoFromPlaylist, updatePlayList } from "../controllers/playList.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isOwnerOfthePlayList } from "../middlewares/isOwnerOfContent.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/createPlayList").post(createPlaylist);
router.route("/userPlayList/:userId").get(getPlayListByuserId);
router.route("/getPlayListbyId/:playListId").get(getPlaylistbyId);
router.route("/addvideoInPlayList").patch(addVideoToPlayList);
router.route("/removeVideofromPlaylist").patch(removeVideoFromPlaylist);
router.route("/updatePlayList/:playListId").patch(updatePlayList);
router.route("/deletePlayList/:playListId").delete(isOwnerOfthePlayList,deletePlayList);

export default router
