const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

/* ============================================================
   GET ALL COURSES (teacher = created courses, student = enrolled)
=============================================================== */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    let courses;
    if (user.role === 'teacher') {
      courses = await Course.find({ teacher: req.user.id })
        .populate('teacher', ['name', 'email'])
        .sort({ createdAt: -1 });
    } else {
      courses = await Course.find({ students: req.user.id })
        .populate('teacher', ['name', 'email'])
        .sort({ createdAt: -1 });
    }

    res.json(courses);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ============================================================
   GET COURSE BY ID + STUDENT PROGRESS
=============================================================== */
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', ['name', 'email'])
      .populate('students', ['name', 'email']);

    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const isTeacher = course.teacher._id.toString() === req.user.id;
    const isStudent = course.students.some(
      (s) => s._id.toString() === req.user.id
    );

    if (!isTeacher && !isStudent)
      return res.status(401).json({ msg: 'Not authorized' });

    let studentProgress = null;

    if (isStudent) {
      studentProgress = course.progress.find(
        (p) => p.student.toString() === req.user.id
      );
    }

    res.json({ course, studentProgress });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ============================================================
   CREATE COURSE (TEACHER ONLY) + MODULE SUPPORT
=============================================================== */
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id);

      if (user.role !== 'teacher')
        return res.status(401).json({ msg: 'Only teachers can create' });

      const { title, description, imageUrl, modules } = req.body;

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const course = new Course({
        title,
        description,
        imageUrl,
        teacher: req.user.id,
        students: [],
        code,
        modules: modules || [],
        progress: [],
      });

      await course.save();
      res.json(course);
    } catch (err) {
      res.status(500).send('Server Error');
    }
  }
);

/* ============================================================
   UPDATE COURSE (teacher only)
=============================================================== */
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ msg: 'Course not found' });

    if (course.teacher.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    const { title, description, imageUrl, modules } = req.body;

    if (title) course.title = title;
    if (description) course.description = description;
    if (imageUrl) course.imageUrl = imageUrl;
    if (modules) course.modules = modules;

    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ============================================================
   DELETE COURSE (teacher only)
=============================================================== */
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ msg: 'Course not found' });

    if (course.teacher.toString() !== req.user.id)
      return res.status(401).json({ msg: 'Not authorized' });

    await Course.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Course removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ============================================================
   ENROLL STUDENT + AUTO CREATE PROGRESS
=============================================================== */
router.put('/:id/enroll', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'student')
      return res.status(401).json({ msg: 'Only students can enroll' });

    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ msg: 'Course not found' });

    if (course.students.includes(req.user.id))
      return res.status(400).json({ msg: 'Already enrolled' });

    course.students.push(req.user.id);

    // Create progress entry
    course.progress.push({
      student: req.user.id,
      completedModules: 0,
      totalModules: course.modules.length,
    });

    await course.save();

    res.json({ msg: 'Enrolled successfully', course });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ============================================================
   UNENROLL STUDENT
=============================================================== */
router.put('/:id/unenroll', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== 'student')
      return res.status(401).json({ msg: 'Only students can unenroll' });

    const course = await Course.findById(req.params.id);

    if (!course) return res.status(404).json({ msg: 'Course not found' });

    if (!course.students.includes(req.user.id))
      return res.status(400).json({ msg: 'Not enrolled' });

    course.students = course.students.filter(
      (s) => s.toString() !== req.user.id
    );

    course.progress = course.progress.filter(
      (p) => p.student.toString() !== req.user.id
    );

    await course.save();

    res.json({ msg: 'Unenrolled successfully', course });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ============================================================
   STUDENT COMPLETES MODULE → UPDATE PROGRESS
=============================================================== */
router.put('/:courseId/progress/:moduleId', auth, async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ msg: 'Course not found' });

    const module = course.modules.id(moduleId);
    if (!module) return res.status(404).json({ msg: 'Module not found' });

    // If not already completed
    if (!module.completedBy.includes(req.user.id)) {
      module.completedBy.push(req.user.id);

      const progress = course.progress.find(
        (p) => p.student.toString() === req.user.id
      );

      progress.completedModules += 1;
    }

    await course.save();
    res.json({ msg: 'Module marked completed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

/* ============================================================
   JOIN COURSE BY CODE (student only)
=============================================================== */
router.post('/join', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'student')
      return res.status(401).json({ msg: 'Only students can join' });

    const { code } = req.body;
    const course = await Course.findOne({ code });

    if (!course)
      return res.status(404).json({ msg: 'Invalid course code' });

    if (course.students.includes(req.user.id))
      return res.status(400).json({ msg: 'Already enrolled' });

    course.students.push(req.user.id);

    course.progress.push({
      student: req.user.id,
      completedModules: 0,
      totalModules: course.modules.length,
    });

    await course.save();

    res.json({ msg: 'Joined successfully', course });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
