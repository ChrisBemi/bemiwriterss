const mongoose = require("mongoose");
const DateGenerator = require("../utils/DateGenerator");

const AnswersSchema = new mongoose.Schema({
  writerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  description: {
    type: String,
  },
  files: [
    {
      fileName: { type: String, required: true },
      downloadURL: { type: String, required: true },
    }
  ],
  createdAt: {
    type: String,
    default: DateGenerator(),
  },
  inRevision: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    required: true,
  },
  submittedAt:{
    type:String
  }
});

const Answer = mongoose.model("Answer", AnswersSchema);

module.exports = Answer;
