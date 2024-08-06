const router = require("express").Router();

const AnswersController = require("../controllers/AnswersController");

router.post(
  "/post",
  AnswersController.uploadFiles,
  AnswersController.submitAnswers
);
router.get("/get", AnswersController.getSubmittedAnswers);

router.put(
  "/:answerId/update/revision",
  AnswersController.uploadFiles,
  AnswersController.setRevision
);
router.put("/:answerId/:assignmentId/cancel/revision", AnswersController.cancelInRevision);

router.get("/:answerId/download", AnswersController.downloadAnsweredFiles);

router.get(
  "/:writerId/work/in/revision",
  AnswersController.getUsersInRevisionWork
);

router.delete("/:answerId/delete/answer", AnswersController.deleteAnswer);

module.exports = router;
