const User = require("../models/Users.model");
const Assignment = require("../models/Assignment.model");

const Answer = require("../models/Answers.model");
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const singleUser = await User.findById(id);

    if (!singleUser) {
      return res
        .status(404)
        .json({ status: 404, success: false, message: "User not found" });
    }

    const bidsCount = await Assignment.countDocuments({
      writers: id,
      assigned: false,
    });
    const completedCount = await Assignment.countDocuments({
      writers: id,
      completed: true,
    });

    const revisionCount = await Answer.countDocuments({
      writerId: id,
      inRevision: true,
    });

    const inReviewCount = await Assignment.countDocuments({
      writers: id,
      inReview: true,
    });

    const inProgressCount = await Assignment.countDocuments({
      assignedTo: id,
      assigned: true,
      completed: false,
      inReview: false,
    });
    const userData = {
      _id: singleUser._id,
      firstName: singleUser.firstName,
      lastName: singleUser.lastName,
      email: singleUser.email,
      phoneNo: singleUser.phoneNo,
      createdAt: singleUser.createdAt,
      role: singleUser.role,
      educationLevel: singleUser.educationLevel,
      qualifications: singleUser.qualifications,
      amount: singleUser.amount,
      systemId: singleUser.systemId,
      __v: singleUser.__v,
      description: singleUser.description,
      profileUrl: singleUser.profile ? singleUser.profile.downloadURL : null,
      bidsCount,
      completedCount,
      revisionCount,
      inProgressCount,
      inReviewCount,
    };

    return res.status(200).json({ status: 200, success: true, data: userData });
  } catch (error) {
    console.error("Error in getUserById:", error);
    next(error);
  }
};

module.exports = { getUserById };
