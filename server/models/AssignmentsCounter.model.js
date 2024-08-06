const mongoose = require('mongoose');

const AssignmentCounterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  seq: {
    type: Number,
    default: 0
  }
});

const AssignmentCounter = mongoose.model('AssignmentCounter', AssignmentCounterSchema);

module.exports = AssignmentCounter;
