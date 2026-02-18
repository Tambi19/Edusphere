import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import api from '../../utils/api';
import AuthContext from '../../context/auth/authContext';

const EditAssignment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const getFormattedDate = date => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: getFormattedDate(new Date()),
    totalPoints: 100,
    aiGradingEnabled: true,
    course: ''
  });

  const [rubricItems, setRubricItems] = useState([]);
  const [newRubricItem, setNewRubricItem] = useState({
    criteria: '',
    weight: 10,
    description: ''
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [course, setCourse] = useState(null);

  /* ================= FETCH ASSIGNMENT ================= */
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setFetchLoading(true);

        const res = await api.get(`/api/assignments/${id}`);
        const assignment = res.data.assignment;

        setFormData({
          title: assignment.title || '',
          description: assignment.description || '',
          dueDate: getFormattedDate(assignment.dueDate),
          totalPoints: assignment.totalPoints ?? 100,
          aiGradingEnabled: assignment.aiGradingEnabled ?? true,
          course:
            typeof assignment.course === 'object'
              ? assignment.course._id
              : assignment.course
        });

        setRubricItems(assignment.rubric || []);

        const courseId =
          typeof assignment.course === 'object'
            ? assignment.course._id
            : assignment.course;

        if (courseId) {
          const courseRes = await api.get(`/api/courses/${courseId}`);
          setCourse(courseRes.data);
        }
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load assignment');
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) fetchAssignment();
  }, [id]);

  /* ================= HANDLERS ================= */
  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSwitchChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.checked });

  const onRubricItemChange = e =>
    setNewRubricItem({ ...newRubricItem, [e.target.name]: e.target.value });

  const onFileChange = e => setFile(e.target.files[0]);

  const addRubricItem = () => {
    if (!newRubricItem.criteria || !newRubricItem.weight) {
      setError('Criteria and weight are required');
      return;
    }
    setRubricItems([...rubricItems, newRubricItem]);
    setNewRubricItem({ criteria: '', weight: 10, description: '' });
  };

  const removeRubricItem = index =>
    setRubricItems(rubricItems.filter((_, i) => i !== index));

  /* ================= SUBMIT ================= */
  const onSubmit = async e => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (file) {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) =>
          data.append(key, value)
        );
        data.append('dueDate', new Date(formData.dueDate).toISOString());
        data.append('rubric', JSON.stringify(rubricItems));
        data.append('file', file);

        await api.put(`/api/assignments/${id}`, data);
      } else {
        await api.put(`/api/assignments/${id}`, {
          ...formData,
          dueDate: new Date(formData.dueDate).toISOString(),
          rubric: rubricItems
        });
      }

      setSuccess('Assignment updated successfully!');
      setTimeout(() => navigate(`/courses/${formData.course}`), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (user && user.role !== 'teacher') navigate('/dashboard');
  }, [user, navigate]);

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const { title, description, dueDate, totalPoints, aiGradingEnabled } = formData;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4">Edit Assignment</Typography>

        {course && (
          <Typography color="text.secondary">
            Course: {course.title}
          </Typography>
        )}

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <TextField fullWidth label="Title" name="title" value={title} onChange={onChange} />
          <TextField fullWidth multiline rows={4} label="Description" name="description" value={description} onChange={onChange} />
          <TextField type="datetime-local" name="dueDate" value={dueDate} onChange={onChange} />
          <TextField type="number" name="totalPoints" value={totalPoints} onChange={onChange} />

          <FormControlLabel
            control={<Switch checked={aiGradingEnabled} onChange={onSwitchChange} name="aiGradingEnabled" />}
            label="Enable AI Grading"
          />

          <Button component="label">
            Upload File
            <input hidden type="file" onChange={onFileChange} />
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Assignment'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditAssignment;
