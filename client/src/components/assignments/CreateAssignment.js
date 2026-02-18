import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

import api from '../../utils/api'; // ✅ CENTRAL AXIOS INSTANCE

const CreateAssignment = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useContext(AuthContext);

  /* ================= HELPERS ================= */
  const getFormattedDate = (date) => {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  /* ================= STATE ================= */
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: getFormattedDate(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalPoints: 100,
    aiGradingEnabled: true
  });

  const [rubricItems, setRubricItems] = useState([]);
  const [newRubricItem, setNewRubricItem] = useState({
    criteria: '',
    weight: 10,
    description: ''
  });
  const [file, setFile] = useState(null);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { title, description, dueDate, totalPoints, aiGradingEnabled } = formData;

  /* ================= FETCH COURSE ================= */
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/api/courses/${courseId}`);
        setCourse(res.data);
      } catch {
        setError('Failed to fetch course details');
      }
    };

    if (courseId) fetchCourse();
  }, [courseId]);

  /* ================= HANDLERS ================= */
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSwitchChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.checked });

  const onRubricItemChange = (e) =>
    setNewRubricItem({ ...newRubricItem, [e.target.name]: e.target.value });

  const addRubricItem = () => {
    if (!newRubricItem.criteria || !newRubricItem.weight) {
      setError('Criteria and weight are required');
      return;
    }

    setRubricItems([...rubricItems, newRubricItem]);
    setNewRubricItem({ criteria: '', weight: 10, description: '' });
  };

  const removeRubricItem = (index) =>
    setRubricItems(rubricItems.filter((_, i) => i !== index));

  const onFileChange = (e) => setFile(e.target.files[0]);

  /* ================= SUBMIT ================= */
  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title || !description) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      let res;

      if (file) {
        const data = new FormData();
        data.append('title', title);
        data.append('description', description);
        data.append('dueDate', new Date(dueDate).toISOString());
        data.append('totalPoints', totalPoints);
        data.append('aiGradingEnabled', aiGradingEnabled);
        data.append('course', courseId);
        data.append('rubric', JSON.stringify(rubricItems));
        data.append('file', file);

        res = await api.post('/api/assignments', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/api/assignments', {
          ...formData,
          dueDate: new Date(dueDate).toISOString(),
          course: courseId,
          rubric: rubricItems
        });
      }

      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  /* ================= AUTH GUARD ================= */
  if (user && user.role !== 'teacher') {
    navigate('/dashboard');
    return null;
  }

  /* ================= UI ================= */
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Assignment
        </Typography>

        {course && (
          <Typography color="text.secondary">
            Course: {course.title}
          </Typography>
        )}

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Assignment Title"
                value={title}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Assignment Description"
                value={description}
                onChange={onChange}
                multiline
                rows={4}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="dueDate"
                type="datetime-local"
                label="Due Date"
                value={dueDate}
                onChange={onChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                name="totalPoints"
                type="number"
                label="Total Points"
                value={totalPoints}
                onChange={onChange}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={aiGradingEnabled}
                    onChange={onSwitchChange}
                    name="aiGradingEnabled"
                  />
                }
                label="Enable AI Grading"
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" component="label">
                Upload File
                <input hidden type="file" onChange={onFileChange} />
              </Button>
              {file && <Typography sx={{ mt: 1 }}>{file.name}</Typography>}
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Grading Rubric
              </Typography>

              <List>
                {rubricItems.map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${item.criteria} (${item.weight}%)`}
                      secondary={item.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => removeRubricItem(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="criteria"
                    label="Criteria"
                    value={newRubricItem.criteria}
                    onChange={onRubricItemChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="weight"
                    label="Weight (%)"
                    type="number"
                    value={newRubricItem.weight}
                    onChange={onRubricItemChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    value={newRubricItem.description}
                    onChange={onRubricItemChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button startIcon={<AddIcon />} onClick={addRubricItem}>
                    Add Rubric Item
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => navigate(`/courses/${courseId}`)}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Creating...' : 'Create Assignment'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateAssignment;
