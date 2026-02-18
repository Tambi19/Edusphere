const mongoose = require('mongoose');

// -------- MODULE SCHEMA (optional) ----------
const ModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  index: { type: Number }, // ordering
  createdAt: { type: Date, default: Date.now }
});

// -------- PROGRESS SCHEMA (per student) ----------
const ProgressSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  completedModules: { type: Number, default: 0 },
  completedModuleIds: [{ type: mongoose.Schema.Types.ObjectId }],
  totalModules: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
});

// -------- COURSE SCHEMA ----------
const CourseSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ],

  code: {
    type: String,
    required: true,
    unique: true
  },

  imageUrl: {
    type: String,
    default: ''
  },

  // 🔥 NEW FIELD: total number of modules in this course
  totalModules: {
    type: Number,
    default: 0
  },

  // 🔥 NEW FIELD: array of modules created by teacher
  modules: [ModuleSchema],

  // 🔥 NEW FIELD: progress tracking for each student
  progress: [ProgressSchema],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ---------- UNIQUE CODE GENERATION ----------
CourseSchema.pre('save', async function (next) {
  if (!this.code) {
    const generateCode = () =>
      Math.random().toString(36).substring(2, 8).toUpperCase();

    let code;
    let isUnique = false;

    for (let i = 0; i < 5; i++) {
      code = generateCode();
      const exists = await mongoose.model('course').findOne({ code });
      if (!exists) {
        isUnique = true;
        break;
      }
    }

    if (!isUnique) {
      return next(
        new Error('Unable to generate a unique course code. Please try again.')
      );
    }

    this.code = code;
  }

  next();
});

module.exports = mongoose.model('course', CourseSchema);
