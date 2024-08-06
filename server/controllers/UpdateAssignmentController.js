const Assignment = require("../models/Assignment.model");
const updateAssignmentCharges = async (req, res, next) => {
  const { id } = req.params;

  const { charges } = req.body;

  try {
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res
        .status(200)
        .json({ status: 404, success: false, message: "Assignment not found" });
    }

    assignment.charges = charges;

    await assignment.save();

    res.status(200).json({
      status: 200,
      success: true,

      message: "Assignment charges updated successfully",

      assignment: assignment,
    });
  } catch (error) {
    next(error);
  }
};
const updateAssignmentTime = async (req, res, next) => {
  const { id } = req.params;

  const { time } = req.body;

  try {
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res
        .status(200)
        .json({ status: 404, success: false, message: "Assignment not found" });
    }

    assignment.time = time;

    await assignment.save();

    res.status(200).json({
      status: 200,
      success: true,

      message: "Submission time updated successfully",

      assignment: assignment,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { updateAssignmentCharges,updateAssignmentTime };
