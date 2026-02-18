const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const OpenAI = require('openai');
const natural = require('natural');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// @route   POST api/ai/grade-submission/:id
// @desc    Auto-grade a submission using AI
// @access  Private/Teacher
router.post('/grade-submission/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to use AI grading' });
    }

    const submissionId = req.params.id;
    
    // Verify submission exists
    const submission = await Submission.findById(submissionId).populate({
      path: 'assignment',
      populate: {
        path: 'course'
      }
    });
    
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    
    // Verify teacher owns the course
    if (
      submission.assignment.course.teacher.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Not authorized to grade this submission' });
    }
    
    // Get assignment details
    const assignment = submission.assignment;
    
    // Prepare prompt for OpenAI
    const prompt = `
      I have a student submission for an assignment. Please grade it based on the rubric.
      
      ASSIGNMENT TITLE: ${assignment.title}
      ASSIGNMENT DESCRIPTION: ${assignment.description}
      TOTAL POINTS: ${assignment.totalPoints}
      
      RUBRIC:
      ${assignment.rubric.map(r => `- ${r.criteria} (${r.weight} points): ${r.description || ''}`).join('\n')}
      
      STUDENT SUBMISSION:
      ${submission.content}
      
      Please provide:
      1. A grade out of ${assignment.totalPoints} points
      2. Detailed feedback for the student
      3. Scores for each rubric criteria with specific feedback for each
    `;
    
    // Call OpenAI API
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an experienced teaching assistant who provides fair and detailed grading. Your feedback should be constructive, highlight strengths, and offer suggestions for improvement."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    // Extract the response
    const aiGradingResult = aiResponse.choices[0].message.content;
    
    // Parse the AI response to extract grades
    // This is a simple heuristic and might need to be improved based on the actual format of AI responses
    let overallGrade = null;
    let feedback = aiGradingResult;
    const rubricGrades = [];
    
    // Extract overall grade (basic pattern matching)
    const gradeMatch = aiGradingResult.match(/grade:?\s*(\d+\.?\d*)/i);
    if (gradeMatch) {
      overallGrade = parseFloat(gradeMatch[1]);
    }
    
    // Extract rubric scores if we have a rubric
    if (assignment.rubric && assignment.rubric.length > 0) {
      assignment.rubric.forEach(rubricItem => {
        const regex = new RegExp(`${rubricItem.criteria}[^:]*:?\\s*(\\d+\\.?\\d*)\\s*(?:points|point|pts|pt)?`, 'i');
        const match = aiGradingResult.match(regex);
        
        if (match) {
          const score = parseFloat(match[1]);
          
          // Find feedback related to this criteria
          const tokenizer = new natural.SentenceTokenizer();
          const sentences = tokenizer.tokenize(aiGradingResult);
          
          // Look for sentences containing the criteria name
          const relevantSentences = sentences.filter(sentence => 
            sentence.toLowerCase().includes(rubricItem.criteria.toLowerCase())
          );
          
          rubricGrades.push({
            criteria: rubricItem.criteria,
            score: score,
            feedback: relevantSentences.join(' ')
          });
        }
      });
    }
    
    // Update the submission with AI-generated grades
    submission.grade = overallGrade;
    submission.feedback = feedback;
    submission.gradedBy = 'ai';
    submission.gradedAt = Date.now();
    submission.status = 'graded';
    
    if (rubricGrades.length > 0) {
      submission.rubricGrades = rubricGrades;
    }
    
    await submission.save();
    
    res.json({
      submission,
      aiGradingResult
    });
  } catch (err) {
    console.error('AI Grading Error:', err.message);
    res.status(500).send('AI Grading Error');
  }
});

// @route   POST api/ai/bulk-grade/:assignmentId
// @desc    Bulk grade all ungraded submissions for an assignment
// @access  Private/Teacher
router.post('/bulk-grade/:assignmentId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to use AI grading' });
    }

    const assignmentId = req.params.assignmentId;
    
    // Verify assignment exists
    const assignment = await Assignment.findById(assignmentId).populate('course');
    
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' });
    }
    
    // Verify teacher owns the course
    if (
      assignment.course.teacher.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Not authorized to grade for this assignment' });
    }
    
    // Find all ungraded submissions for this assignment
    const submissions = await Submission.find({
      assignment: assignmentId,
      status: 'submitted'
    });
    
    if (submissions.length === 0) {
      return res.json({ msg: 'No ungraded submissions found' });
    }
    
    // Start a background process to grade all submissions
    // This would typically be done with a proper job queue in production
    res.json({ 
      msg: `Started bulk grading ${submissions.length} submissions. This may take some time.`,
      submissionCount: submissions.length
    });
    
    // Process submissions one by one to avoid rate limits
    for (const submission of submissions) {
      try {
        // Prepare prompt for OpenAI
        const prompt = `
          I have a student submission for an assignment. Please grade it based on the rubric.
          
          ASSIGNMENT TITLE: ${assignment.title}
          ASSIGNMENT DESCRIPTION: ${assignment.description}
          TOTAL POINTS: ${assignment.totalPoints}
          
          RUBRIC:
          ${assignment.rubric.map(r => `- ${r.criteria} (${r.weight} points): ${r.description || ''}`).join('\n')}
          
          STUDENT SUBMISSION:
          ${submission.content}
          
          Please provide:
          1. A grade out of ${assignment.totalPoints} points
          2. Detailed feedback for the student
          3. Scores for each rubric criteria with specific feedback for each
        `;
        
        // Call OpenAI API
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an experienced teaching assistant who provides fair and detailed grading. Your feedback should be constructive, highlight strengths, and offer suggestions for improvement."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        });
        
        // Extract the response
        const aiGradingResult = aiResponse.choices[0].message.content;
        
        // Parse the AI response to extract grades (similar to above)
        let overallGrade = null;
        let feedback = aiGradingResult;
        const rubricGrades = [];
        
        // Extract overall grade (basic pattern matching)
        const gradeMatch = aiGradingResult.match(/grade:?\s*(\d+\.?\d*)/i);
        if (gradeMatch) {
          overallGrade = parseFloat(gradeMatch[1]);
        }
        
        // Extract rubric scores if we have a rubric
        if (assignment.rubric && assignment.rubric.length > 0) {
          assignment.rubric.forEach(rubricItem => {
            const regex = new RegExp(`${rubricItem.criteria}[^:]*:?\\s*(\\d+\\.?\\d*)\\s*(?:points|point|pts|pt)?`, 'i');
            const match = aiGradingResult.match(regex);
            
            if (match) {
              const score = parseFloat(match[1]);
              
              // Find feedback related to this criteria
              const tokenizer = new natural.SentenceTokenizer();
              const sentences = tokenizer.tokenize(aiGradingResult);
              
              // Look for sentences containing the criteria name
              const relevantSentences = sentences.filter(sentence => 
                sentence.toLowerCase().includes(rubricItem.criteria.toLowerCase())
              );
              
              rubricGrades.push({
                criteria: rubricItem.criteria,
                score: score,
                feedback: relevantSentences.join(' ')
              });
            }
          });
        }
        
        // Update the submission with AI-generated grades
        submission.grade = overallGrade;
        submission.feedback = feedback;
        submission.gradedBy = 'ai';
        submission.gradedAt = Date.now();
        submission.status = 'graded';
        
        if (rubricGrades.length > 0) {
          submission.rubricGrades = rubricGrades;
        }
        
        await submission.save();
        
        // Add a delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (err) {
        console.error(`Error grading submission ${submission._id}:`, err.message);
        // Continue with other submissions even if one fails
      }
    }
  } catch (err) {
    console.error('Bulk AI Grading Error:', err.message);
    // Since we already sent a response, we'll just log the error
  }
});

// @route   POST api/ai/feedback/:id
// @desc    Generate personalized feedback for a student
// @access  Private/Teacher
router.post('/feedback/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to generate AI feedback' });
    }

    const submissionId = req.params.id;
    
    // Verify submission exists
    const submission = await Submission.findById(submissionId).populate({
      path: 'assignment',
      populate: {
        path: 'course'
      }
    }).populate('student', 'name');
    
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }
    
    // Verify teacher owns the course
    if (
      submission.assignment.course.teacher.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ msg: 'Not authorized to provide feedback for this submission' });
    }
    
    // Prepare prompt for OpenAI
    const prompt = `
      I need to provide detailed, personalized feedback to a student named ${submission.student.name} on their assignment submission.
      
      ASSIGNMENT TITLE: ${submission.assignment.title}
      ASSIGNMENT DESCRIPTION: ${submission.assignment.description}
      
      STUDENT SUBMISSION:
      ${submission.content}
      
      CURRENT GRADE: ${submission.grade} out of ${submission.assignment.totalPoints}
      
      CURRENT FEEDBACK:
      ${submission.feedback}
      
      Please generate an improved, personalized feedback that:
      1. Addresses the student by name
      2. Highlights specific strengths in their submission
      3. Provides constructive criticism on areas for improvement
      4. Offers specific suggestions to help them enhance their learning
      5. Ends with an encouraging note
    `;
    
    // Call OpenAI API
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an empathetic, experienced educator who provides personalized, constructive feedback to help students improve. Your feedback should be specific, actionable, and encouraging."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    // Extract the response
    const personalizedFeedback = aiResponse.choices[0].message.content;
    
    res.json({
      originalFeedback: submission.feedback,
      personalizedFeedback
    });
  } catch (err) {
    console.error('AI Feedback Error:', err.message);
    res.status(500).send('AI Feedback Error');
  }
});

module.exports = router; 