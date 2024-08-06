const router = require("express").Router();

const WritersController = require("../controllers/WritersController");

router.get("/get", WritersController.getUsers);

router.put("/phone-no/update/:writerId", WritersController.updatePhoneNumber);

router.put(
  "/description/update/:writerId",
  WritersController.updateDescription
);

router.put(
  "/password/update/:writerId",
  WritersController.updateWriterPassword
);

router.get("/assignments/:writerId", WritersController.getWriterWork);


router.get("/assignments/inReview/:writerId", WritersController.getAssignmentsInReview);

router.post(
  "/complete/assignment/:writerId",
  WritersController.updateCompleteWork
);

router.delete("/:writerId/delete", WritersController.deleteWriter);

router.get("/assignments/:id/completed", WritersController.getUserCompletedWork);

module.exports = router;
