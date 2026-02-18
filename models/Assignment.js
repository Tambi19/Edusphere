const mongoose = require('mongoose');

const AssignmentSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'course',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  rubric: [
    {
      criteria: {
        type: String,
        required: true
      },
      weight: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: false
      }
    }
  ],
  aiGradingEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('assignment', AssignmentSchema); 