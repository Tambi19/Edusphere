import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import AlertContext from '../../context/alert/alertContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import api from '../../utils/api';

const AssignmentSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { loading: userLoading, user } = useContext(AuthContext);
  const { setAlert } = useContext(AlertContext);

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState({
    content: '',
    file: null,
    fileName: ''
  });
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /* ================= FETCH ASSIGNMENT ================= */
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/api/assignments/${id}`);
        setAssignment(res.data.assignment);

        if (res.data.submission) {
          setExistingSubmission(res.data.submission);
          setSubmission({
            content: res.data.submission.content || '',
            file: null,
            fileName: res.data.submission.fileName || ''
          });

          if (res.data.submission.grade !== null) {
            setFeedback({
              score: res.data.submission.grade,
              summary: res.data.submission.feedback || ''
            });
          }
        }
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAssignment();
  }, [id]);

  /* ================= FILE HANDLER ================= */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubmission(prev => ({
      ...prev,
      file,
      fileName: file.name
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!submission.content.trim() && !submission.file) {
      setAlert('Please add text or upload a file', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('assignment', id);
      formData.append('content', submission.content);

      if (submission.file) {
        formData.append('file', submission.file);
      }

      const res = await api.post('/api/submissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setExistingSubmission(res.data);
      setAlert('Assignment submitted successfully', 'success');
    } catch (err) {
      setAlert(err.response?.data?.msg || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= HELPERS ================= */
  const formatDate = (date) =>
    new Date(date).toLocaleString();

  const isPastDue = new Date() > new Date(assignment?.dueDate);
  const isStudent = user?.role === 'student';

  /* ================= LOADING / ERROR ================= */
  if (loading || userLoading) {
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
      </Container>
    );
  }

  /* ================= UI ================= */
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mb: 3 }}>
        Back
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {assignment.title}
        </Typography>

        <Chip
          icon={<AccessTimeIcon />}
          label={`Due: ${formatDate(assignment.dueDate)}`}
          color={isPastDue ? 'error' : 'primary'}
          sx={{ mb: 3 }}
        />

        {/* ================= SUBMISSION FORM ================= */}
        {isStudent && !existingSubmission ? (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>

              {/* TEXT ANSWER */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Your Answer"
                  value={submission.content}
                  onChange={(e) =>
                    setSubmission(prev => ({
                      ...prev,
                      content: e.target.value
                    }))
                  }
                />
              </Grid>

              {/* FILE UPLOAD */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Upload File (optional)
                    </Typography>

                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                    >
                      Choose File
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                      />
                    </Button>

                    {submission.fileName && (
                      <Chip
                        icon={<UploadFileIcon />}
                        label={submission.fileName}
                        color="primary"
                        sx={{ ml: 2 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* SUBMIT */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || isPastDue}
                  size="large"
                >
                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                </Button>
              </Grid>

            </Grid>
          </form>
        ) : (
          <>
            <Typography sx={{ mt: 2 }}>
              Submitted on: {formatDate(existingSubmission.createdAt)}
            </Typography>

            <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
              {existingSubmission.content}
            </Typography>

            {existingSubmission.fileName && (
              <Chip
                icon={<UploadFileIcon />}
                label={existingSubmission.fileName}
                color="success"
                sx={{ mt: 2 }}
              />
            )}
          </>
        )}

        {/* ================= FEEDBACK ================= */}
        {feedback && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5">
              Score: {feedback.score}/{assignment.totalPoints}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              {feedback.summary}
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AssignmentSubmission;
