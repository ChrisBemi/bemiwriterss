const mongoose = require("mongoose");
const DateGenerator = require("../utils/DateGenerator"); // Ensure this returns a formatted date string
const AssignmentCounter = require("./AssignmentsCounter.model");

const getNextAssignmentId = async () => {
  const counter = await AssignmentCounter.findOneAndUpdate(
    { name: "orderId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const nextId = counter.seq.toString().padStart(4, "0");
  return nextId;
};
const assignmentSchema = new mongoose.Schema({
  page: {
    type: String,
    required: false,
  },
  orderId: {
    type: String,
  },
  clientName: {
    type: String,
    required:false,
  },
  clientCharges: {
    type:Number,
    default:0,
  },
  words: {
    type: String,
    required: false,
  },
  subject: {
    type: String,
    required: true,
  },
  dateline: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Non technical",
      "Technical",
      "Dissertation",
      "PowerPoint(Without Speaker Notes)",
      "PowerPoint(With Speaker Notes)",
    ],
  },
  charges: {
    type: Number,
    required: true,
  },
  bid: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: String,
    default: DateGenerator,
  },
  bidedAt: {
    type: String,
  },
  writers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  files: [
    {
      fileName: { type: String, required: true },
      downloadURL: { type: String, required: true },
    },
  ],
  assigned: {
    type: Boolean,
    default: false,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  assignedAt: {
    type: String,
  },
  description: {
    type: String,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: String,
  },
  submittedAt: {
    type: String,
  },
  inReview: {
    type: Boolean,
    default: false,
  },
  inRevision: {
    type: Boolean,
    default: false,
  },
  inRevisionComment: {
    type: String,
  },
  inRevisionFiles: [
    {
      fileName: { type: String, required: true },
      downloadURL: { type: String, required: true },
    },
  ],
  penalty: {
    type: Number,
    default: 0,
  },
});

assignmentSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.orderId = await getNextAssignmentId();
  }
  next();
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
