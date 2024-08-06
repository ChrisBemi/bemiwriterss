const router = require("express").Router();
const AssignmentController = require("../controllers/AssignmentController");


router.post(
  "/post",
  AssignmentController.uploadFiles,
  AssignmentController.createAssignment
);

router.get("/get", AssignmentController.getAssignments);

router.get("/get/unassigned", AssignmentController.getUnassignedAssignments);

router.delete("/delete/:id", AssignmentController.deleteAssignment);

router.post("/add/bid/:id", AssignmentController.addBind);

router.get(
  "/check-bind/:orderId/:writerId",
  AssignmentController.checkIfUserHasBind
);

router.get("/remove-bind/:orderId/:writerId", AssignmentController.removeBid);

router.get("/get/all/assignments", AssignmentController.getAllAssignments);

router.put("/assign/:assignmentId", AssignmentController.assignAssignment);



router.get(
  "/assigned/assignments",
  AssignmentController.getAssignedAssignments
);

router.put(
  "/:id/update/dateline",
  AssignmentController.updateAssignmentDateline
);

router.put(
  "/:id/update/files",
  AssignmentController.uploadFiles,
  AssignmentController.updateAssignmentFiles
);

router.put(
  "/:id/update/description",
  AssignmentController.updateAssignmentDescription
);
router.put(
  "/:assignmentId/update/penalty",
  AssignmentController.updateAssignmentPenalties
);

router.put(
  "/:assignmentId/manual/assigning",
  AssignmentController.assignSingleWriterAssignment
);
router.put(
  "/:assignmentId/cancel/assigning",
  AssignmentController.cancelAssignment
);



module.exports = router;
