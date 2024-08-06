const router = require("express").Router();

const updateAssignmentController = require("../controllers/UpdateAssignmentController");

router.put(
  "/assignment/:id/update/charges",
  updateAssignmentController.updateAssignmentCharges
);

router.put(
  "/assignment/:id/update/time",
  updateAssignmentController.updateAssignmentTime
);

module.exports = router;
