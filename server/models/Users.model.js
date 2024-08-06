const mongoose = require("mongoose");
const DateGenerator = require("../utils/DateGenerator");
const Counter = require("./Counter.model"); // Replace with correct path to Counter model

const getNextUserId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "systemId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const nextId = counter.seq.toString().padStart(4, "0");
  return nextId;
};

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNo: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  systemId: {
    type: String,
  },
  createdAt: {
    type: String,
    default: DateGenerator(),
  },
  role: {
    type: String,
    enum: ["writer", "admin"],
    default: "writer",
  },
  profile: {
    fileName: { type: String },
    downloadURL: { type: String },
  },
  educationLevel: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  qualifications: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  pending: {
    type: Boolean,
    default: false,
  },
});

UserSchema.pre("save", async function (next) {
  if (this.isNew) {
    this.systemId = await getNextUserId();
  }
  next();
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
