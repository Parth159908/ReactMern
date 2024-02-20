import { Router } from "express";
import { changeUserPassword, getCurrentUser, getTokenCount, logInUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvtar, updateUserCoverImage, userChannelProfile, watchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(logInUser);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeUserPassword);
router.route("/currentUserInformation").get(verifyJWT, getCurrentUser);
router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails);
router.route("/updateAvtar").patch(verifyJWT, upload.single("avtar"), updateUserAvtar);
router.route("/updateCoverImage").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/channel/:userName").get(verifyJWT, userChannelProfile);
router.route("/watchHistory").get(verifyJWT, watchHistory);
router.route("/tokenCount").post(getTokenCount);


export default router; 