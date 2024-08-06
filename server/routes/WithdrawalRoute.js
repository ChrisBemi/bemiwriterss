const router = require("express").Router();

const WithdrawalController = require("../controllers/WithdrawalController");

const WithdrawalRecordsController = require("../controllers/WithdrawalRecordsController");

router.post(
  "/:writerId/request/withdrawal",
  WithdrawalController.requestWithDrawal
);

router.get("/get", WithdrawalController.getWithDrawals);

router.get("/get/:writerId", WithdrawalController.getWithDrawalsById);

router.put(
  "/:withdrawalId/clear/user-history",
  WithdrawalController.clearWithDrawal
);

router.get(
  "/download/history",
  WithdrawalRecordsController.DownloadWithdrawalsRecords
);

router.delete(
  "/:withdrawalId/delete",
  WithdrawalController.deleteSingleWithdrawal
);

router.put("/:withdrawalId/clear", WithdrawalController.clearWithDrawal);

router.put("/:writerId/clear/history", WithdrawalController.clearWriterHistory);

router.delete(
  "/delete/withdrawals",
  WithdrawalController.deleteSelectedWithdrawals
);

module.exports = router;
