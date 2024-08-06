const router = require("express").Router();

const ProfileController = require("../controllers/ProfileController");

router.post("/:userId/update/name", ProfileController.updateUserNames);

router.post(
  "/:userId/update/profile-image",
  ProfileController.upload.single("profileImage"),
  ProfileController.updateProfileImage
);


router.post("/:userId/update/email-profile",ProfileController.updateEmail);

router.post("/verify/email-profile",ProfileController.verifyEmail);
router.post("/update-password/:userId",ProfileController.updateProfilePassword);

module.exports = router;

