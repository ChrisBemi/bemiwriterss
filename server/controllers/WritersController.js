const User = require("../models/Users.model");

const Assignment = require("../models/Assignment.model");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");
const DateGenerator = require("../utils/DateGenerator");

const path = require("path");

const Answer = require("../models/Answers.model");

const answersUploads = path.join(__dirname, "../uploads/answers");

const assignmentsUploads = path.join(__dirname, "../uploads/assignments");

const fs = require("fs");

require("dotenv").config();

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ pending: true });

    if (users.length === 0) {
      return res
        .status(200)
        .json({ status: 404, success: false, message: "No users found" });
    }

    return res.status(200).json({ status: 200, success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const updatePhoneNumber = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    const { phoneNumber } = req.body;
    const writer = await User.findById(writerId);
    if (!writer) {
      return res
        .status(404)
        .json({ success: false, message: "The user is not found" });
    }

    if (phoneNumber === writer.phoneNo) {
      return res
        .status(200)
        .json({ success: false, message: "This is already your phone number" });
    }

    const findUserWithSimilarPhoneNo = await User.findOne({
      phoneNo: phoneNumber,
    });
    if (findUserWithSimilarPhoneNo) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number already in use" });
    }

    writer.phoneNo = phoneNumber;
    await writer.save();
    return res
      .status(200)
      .json({ success: true, message: "Phone number updated successfully" });
  } catch (error) {
    next(error);
  }
};

const updateDescription = async (req, res, next) => {
  try {
    const { writerId } = req.params;

    const { description } = req.body;

    const writer = await User.findById(writerId);
    if (!writer) {
      return res
        .status(404)
        .json({ success: false, message: "The user is not found" });
    }

    writer.description = description;

    await writer.save();

    return res.status(200).json({
      success: true,
      message: "Writer description updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateWriterPassword = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    const writer = await User.findById(writerId);

    if (!writer) {
      return res
        .status(404)
        .json({ success: false, message: "The user is not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    writer.password = hashedPassword;

    await writer.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const getWriterWork = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    
    const assignment = await Assignment.find({
      assignedTo: writerId,
      completed: false,
    }).sort({ assignedAt: 1 });
    if (!assignment || assignment.length === 0) {
      return res.status(200).json({
        status: 404,
        success: false,
        message: "You have not been assigned any work so far",
      });
    }
    return res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

const getAssignmentsInReview = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    if (!writerId) {
      return res.status(200).json({
        status: 404,
        success: false,
        message: "The writer Id is required",
      });
    }

    const assignmentsInReview = await Assignment.find({
      writers: writerId,
      inReview: true,
    });

    if (!assignmentsInReview || assignmentsInReview.length === 0) {
      return res.status(200).json({
        status: 400,
        success: false,
        message: "The writer does not have any assignments in review!",
      });
    } else {
      return res.status(200).json({
        success: true,
        data: assignmentsInReview,
      });
    }
  } catch (error) {
    next(error);
  }
};

const updateCompleteWork = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    const { assignmentId, amount } = req.body;
    if (!writerId || !assignmentId) {
      return res.status(404).json({
        success: false,
        message: "UserId and AssignmentId are required",
      });
    }
    const user = await User.findById(writerId);
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }
    const isWriterAssigned = assignment.writers.some(
      (writer) => writer._id.toString() === writerId
    );
    if (!isWriterAssigned) {
      return res.status(403).json({
        success: false,
        message: "Writer not assigned to this assignment",
      });
    }
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Writer not found in the system!!",
      });
    }

    const answer = await Answer.find({ assignmentId: assignmentId });
    user.amount += amount;
    user.amount -= assignment.penalty;
    assignment.completed = true;
    assignment.completedAt = DateGenerator();
    assignment.inReview = false;
    assignment.inRevision = false;
    answer.inRevision = false;
    await assignment.save();
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Assignment marked as complete" });
  } catch (error) {
    next(error);
  }
};

const deleteWriter = async (req, res, next) => {
  try {
    const { writerId } = req.params;
    const writer = await User.findById(writerId);
    if (!writer) {
      return res.status(400).json({
        success: false,
        message: "Writer not found or invalid writer Id",
      });
    }
    const answers = await Answer.find({ writerId: writer._id });
    if (answers.length > 0) {
      for (const answer of answers) {
        for (const file of answer.files) {
          const filePath = path.join(answersUploads, file);
          fs.unlinkSync(filePath);
        }
      }
      await Answer.deleteMany({ writerId: writer._id });
    }
    const assignments = await Assignment.find({ writers: writer._id });
    if (assignments.length > 0) {
      for (const assignment of assignments) {
        for (const file of assignment.files) {
          const filePath = path.join(assignmentsUploads, file);
          fs.unlinkSync(filePath);
        }
      }
      await Assignment.deleteMany({ writers: writer._id });
    }
    await User.findByIdAndDelete(writerId);
    res.status(200).json({
      success: true,
      message:
        "Writer, associated answers, and assignments deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting writer:", error);
    next(error);
  }
};

const getUserCompletedWork = async (req, res, next) => {
  try {
    const { id } = req.params;

    const completedWork = await Assignment.find({
      writers: id,
      completed: true,
    });

    if (!completedWork || completedWork.length === 0) {
      return res.status(404).json({
        status: 404,
        success: false,
        message: "No completed work found for this user",
      });
    }

    return res
      .status(200)
      .json({ status: 200, success: true, data: completedWork });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  updatePhoneNumber,
  updateDescription,
  updateWriterPassword,
  getWriterWork,
  updateCompleteWork,
  deleteWriter,
  getUserCompletedWork,
  getAssignmentsInReview,
};
