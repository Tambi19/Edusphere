import {
  Alert,
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import api from '../../utils/api';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/api/courses/${id}`);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          imageUrl: res.data.imageUrl || ''
        });
      } catch {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  useEffect(() => {
    if (user && user.role !== 'teacher') navigate('/dashboard');
  }, [user, navigate]);

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();

    try {
      setUpdating(true);
      await api.put(`/api/courses/${id}`, formData);
      setSuccess('Course updated successfully');
      setTimeout(() => navigate(`/courses/${id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4">Edit Course</Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>

            <Grid item xs={12}>
              <TextField name="title" label="Title" value={formData.title} onChange={onChange} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={onChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
              <TextField
                name="imageUrl"
                label="Image URL"
                value={formData.imageUrl}
                onChange={onChange}
                fullWidth
              />

              {formData.imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <CardMedia component="img" image={formData.imageUrl} height="200" />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => navigate(`/courses/${id}`)} variant="outlined">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={updating}>
                  {updating ? 'Updating...' : 'Update'}
                </Button>
              </Box>
            </Grid>

          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditCourse;
