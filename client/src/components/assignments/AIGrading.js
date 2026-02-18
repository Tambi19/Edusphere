import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';
import api from '../../utils/api';

import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Slider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';

import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const AIGrading = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: userLoading } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const [feedback, setFeedback] = useState({
    score: 0,
    comments: [],
    summary: ''
  });

  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState('positive');
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const assignmentRes = await api.get(`/api/assignments/${id}`);
        setAssignment(assignmentRes.data.assignment);

        const submissionsRes = await api.get(`/api/submissions/assignment/${id}`);
        setSubmissions(submissionsRes.data);

        if (submissionsRes.data.length > 0) {
          const first = submissionsRes.data[0];
          setCurrentSubmission(first);

          if (first.grade !== null) {
            setFeedback({
              score: first.grade,
              summary: first.feedback || '',
              comments: first.rubricGrades
                ? first.rubricGrades.map(r => ({
                    text: r.feedback,
                    type: r.score > 0 ? 'positive' : 'negative'
                  }))
                : []
            });
          }
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load assignment');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ================= AI MOCK ================= */

  const generateAIAnalysis = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const analysis = {
        suggestedScore: 85,
        strengths: ['Clear explanation', 'Good structure'],
        weaknesses: ['Needs more examples']
      };

      setAiAnalysis(analysis);
      setFeedback({
        score: analysis.suggestedScore,
        comments: [
          { text: 'Well explained solution', type: 'positive' },
          { text: 'Add more examples', type: 'negative' }
        ],
        summary: 'Overall good work, but needs more examples.'
      });

      setIsAnalyzing(false);
    }, 2000);
  };

  /* ================= SUBMIT ================= */

  const submitFeedback = async () => {
    try {
      setIsSaving(true);

      const rubricGrades = feedback.comments.map(c => ({
        criteria: c.type === 'positive' ? 'Strength' : 'Improvement',
        score: c.type === 'positive' ? 1 : 0,
        feedback: c.text
      }));

      await api.put(`/api/submissions/${currentSubmission._id}/grade`, {
        grade: feedback.score,
        feedback: feedback.summary,
        rubricGrades
      });

      setAlert('Feedback submitted successfully', 'success');
      setIsSaving(false);
    } catch (err) {
      setAlert(err.response?.data?.msg || 'Submission failed', 'error');
      setIsSaving(false);
    }
  };

  /* ================= GUARDS ================= */

  if (userLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>Back</Button>
      </Container>
    );
  }

  if (user?.role !== 'teacher') {
    navigate('/dashboard');
    return null;
  }

  /* ================= UI ================= */

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button onClick={() => navigate(-1)} variant="outlined">Back</Button>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4">{assignment.title}</Typography>
        <Typography sx={{ mt: 1 }}>{assignment.description}</Typography>
      </Paper>

      <Paper sx={{ mt: 4 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          {submissions.map((s, i) => (
            <Tab key={s._id} label={s.student.name} />
          ))}
        </Tabs>

        <TabPanel value={tabValue} index={tabValue}>
          <Typography variant="h6">Submission</Typography>

          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography whiteSpace="pre-wrap">
              {currentSubmission?.content}
            </Typography>
          </Paper>

          <Button
            sx={{ mt: 2 }}
            startIcon={<SmartToyIcon />}
            onClick={generateAIAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
          </Button>

          <Box sx={{ mt: 3 }}>
            <Typography>Score: {feedback.score}</Typography>
            <Slider
              value={feedback.score}
              max={assignment.totalPoints || 100}
              onChange={(e, v) => setFeedback({ ...feedback, score: v })}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={3}
            sx={{ mt: 2 }}
            value={feedback.summary}
            onChange={e => setFeedback({ ...feedback, summary: e.target.value })}
            placeholder="Overall feedback"
          />

          <Button
            fullWidth
            sx={{ mt: 3 }}
            variant="contained"
            startIcon={isSaving ? <CircularProgress size={20} /> : <SendIcon />}
            disabled={isSaving}
            onClick={submitFeedback}
          >
            Submit Feedback
          </Button>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AIGrading;
