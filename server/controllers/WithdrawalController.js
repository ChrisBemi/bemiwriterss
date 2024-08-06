const Withdrawal = require("../models/Withdrawal.model");
const User = require("../models/Users.model");
const { transporter } = require("../utils/transporter");
const requestWithDrawal = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    const { amount, phoneNo } = req.body;

    if (!writerId) {
      return res
        .status(200)
        .json({ success: false, message: "Writer Id is required" });
    }
    const user = await User.findById(writerId);
    if (user.amount < amount) {
      return res.status(200).json({
        success: false,
        message:
          "Amount withdrawable should be more than balance in the system",
      });
    }
    const withdrawals = await Withdrawal.find({
      writer: writerId,
      pending: true,
    });
    if (withdrawals.length >= 3) {
      return res.status(200).json({
        success: false,
        message:
          "You cannot have more than 3 pending withdrawals. Please wait until others are processed.",
      });
    }
    if (!phoneNo || !phoneNo.trim().match(/^0\d{9}$/)) {
      return res.status(200).json({
        success: false,
        message: "A valid Safaricom phone number is required",
      });
    }
    if (!amount || isNaN(amount)) {
      return res.status(200).json({
        success: false,
        message: "Amount must be a number!",
      });
    }

    const existingWithdrawal = await Withdrawal.findOne({ phoneNo: phoneNo });
    if (
      existingWithdrawal &&
      existingWithdrawal.writer.toString() !== writerId
    ) {
      return res.status(200).json({
        success: false,
        message: "Phone number is used by another withdrawer",
      });
    }
    const userUsingNumber = await User.findOne({ phoneNo: phoneNo });
    if (userUsingNumber && userUsingNumber._id.toString() !== writerId) {
      return res.status(200).json({
        success: false,
        message: "Phone number is already associated with another user",
      });
    }
    const newWithdrawal = new Withdrawal({
      writer: writerId,
      amount: amount,
      pending: true,
      phoneNo: phoneNo,
      requestedAmount: amount,
    });
    await newWithdrawal.save();
    return res.status(200).json({
      success: true,
      message: "Withdrawal request sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getWithDrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({}).populate({
      path: "writer",
      select: "firstName lastName email",
    });

    if (!withdrawals || withdrawals.length === 0) {
      return res.status(200).json({
        status: 404,
        success: false,
        message: "Withdrawals not found",
      });
    }

    return res
      .status(200)
      .json({ status: 200, success: true, data: withdrawals });
  } catch (error) {
    next(error);
  }
};

const getWithDrawalsById = async (req, res, next) => {
  try {
    const { writerId } = req.params;

    if (!writerId) {
      return res
        .status(400)
        .json({ success: false, message: "Writer ID is required" });
    }

    const withdrawals = await Withdrawal.find({
      writer: writerId,
      inHistory: false,
    });

    if (!withdrawals || withdrawals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "The user does not have any pending withdrawals",
      });
    }

    return res.status(200).json({ success: true, data: withdrawals });
  } catch (error) {
    next(error);
  }
};

const clearWithDrawal = async (req, res, next) => {
  try {
    const { withdrawalId } = req.params;
    const { amount, writerId } = req.body;

    if (!withdrawalId || !writerId || !amount) {
      return res.status(200).json({
        status: 400,
        success: false,
        message: "Withdrawal ID, Writer ID, and amount are required!",
      });
    }

    const writerAccount = await User.findById(writerId);
    const withdrawal = await Withdrawal.findById(withdrawalId);

    if (!writerAccount) {
      return res.status(200).json({
        status: 404,
        success: false,
        message: "Writer account not found",
      });
    }

    if (!withdrawal) {
      return res.status(200).json({
        status: 404,
        success: false,
        message: "Withdrawal not found",
      });
    }

    const amountToClear = parseFloat(amount);

    if (withdrawal.amount < amountToClear) {
      return res.status(200).json({
        status: 400,
        success: false,
        message:
          "The writer's withdrawal request is less than the amount you want to clear",
      });
    }

    if (writerAccount.amount < amountToClear) {
      return res.status(200).json({
        status: 400,
        success: false,
        message: `The user balance is ${writerAccount.amount} and cannot support withdrawal of ${amountToClear}`,
      });
    }

    const withdrawalAmount = withdrawal.amount;

    if (withdrawal.amount === amountToClear) {
      withdrawal.cleared = true;
      withdrawal.pending = false;
    }

    withdrawal.amountPaid += amountToClear;
    withdrawal.amount -= amountToClear;
    withdrawal.balance = withdrawalAmount - amountToClear;
    writerAccount.amount -= amountToClear;

    await writerAccount.save();

    withdrawal.clearedOn = new Date();
    await withdrawal.save();

    return res.status(200).json({
      success: true,
      message: "Withdrawal cleared successfully",
      withdrawal,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSingleWithdrawal = async (req, res, next) => {
  try {
    const { withdrawalId } = req.params;

    const deleteWithdrawal = await Withdrawal.findByIdAndDelete(withdrawalId);

    if (!deleteWithdrawal) {
      return res
        .status(200)
        .json({ status: 404, success: false, message: "Withdrawal not found" });
    } else {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Withdrawal successfully deleted",
      });
    }
  } catch (error) {
    next(error);
  }
};
const clearSingleWithdrawal = async (req, res, next) => {
  try {
    const { withdrawalId } = req.params;

    const deleteWithdrawal = await Withdrawal.findById(withdrawalId);

    if (!deleteWithdrawal) {
      return res
        .status(200)
        .json({ status: 404, success: false, message: "Withdrawal not found" });
    } else {
      deleteWithdrawal.inHistory = true;
      return res.status(200).json({
        status: 200,
        success: true,
        message: "Withdrawal successfully deleted",
      });
    }
  } catch (error) {
    next(error);
  }
};

const clearWriterHistory = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    const result = await Withdrawal.updateMany(
      { writer: writerId, cleared: true },
      { $set: { inHistory: true } }
    );
    if (result.nModified > 0) {
      res.status(200).json({
        status: 200,
        success: true,
        message: "Cleared withdrawals updated to inHistory",
      });
    } else {
      res.status(200).json({
        status: 404,
        success: false,
        message: "No cleared withdrawals found for this writer",
      });
    }
  } catch (error) {
    next(error);
  }
};

const deleteSelectedWithdrawals = async (req, res, next) => {
  try {
    const { withdrawalIds } = req.body;
    if (!Array.isArray(withdrawalIds) || withdrawalIds.length === 0) {
      return res.status(200).json({
        status: 400,
        success: false,
        message: "No withdrawal IDs provided",
      });
    }
    const result = await Withdrawal.deleteMany({ _id: { $in: withdrawalIds } });
    if (result.deletedCount === 0) {
      return res.status(200).json({
        status: 404,
        success: false,
        message: "No withdrawals found for the provided IDs",
      });
    }
    return res.status(200).json({
      status: 200,
      success: true,
      message: `${result.deletedCount} withdrawals successfully deleted`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deleteSelectedWithdrawals,
  requestWithDrawal,
  getWithDrawals,
  getWithDrawalsById,
  clearWithDrawal,
  deleteSingleWithdrawal,
  clearWriterHistory,
  clearSingleWithdrawal,
  clearWithDrawal
};
