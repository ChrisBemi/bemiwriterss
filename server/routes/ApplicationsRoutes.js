const router = require("express").Router();

const ApplicationsController = require("../controllers/ApplicationsController");

router.get("/get/pending", ApplicationsController.getPendingApplications);

router.put("/:id/reject/application", ApplicationsController.rejectApplication);

router.put(
  "/:id/approve/application",
  ApplicationsController.approveApplication
);

module.exports = router;
