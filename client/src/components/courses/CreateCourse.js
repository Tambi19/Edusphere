import {
  Alert,
  Box,
  Button,
  CardMedia,
  Container,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthContext from '../../context/auth/authContext';
import api from '../../utils/api';

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user, loadUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      if (!user) await loadUser();

      if (user && user.role !== 'teacher') {
        navigate('/dashboard');
      }
    };

    init();
  }, [user, loadUser, navigate]);

  const onChange = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 🔹 Course code is auto-generated in backend
      await api.post('/api/courses', formData);

      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Course
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>

            {/* Course Title */}
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Course Title"
                value={formData.title}
                onChange={onChange}
                fullWidth
                required
              />
            </Grid>

            {/* Course Description */}
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Course Description"
                value={formData.description}
                onChange={onChange}
                fullWidth
                required
                multiline
                rows={4}
              />
            </Grid>

            {/* Image URL */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <TextField
                name="imageUrl"
                label="Image URL (optional)"
                value={formData.imageUrl}
                onChange={onChange}
                fullWidth
              />

              {formData.imageUrl && (
                <Box sx={{ mt: 2 }}>
                  <CardMedia
                    component="img"
                    image={formData.imageUrl}
                    height="200"
                    alt="Course Preview"
                    onError={e =>
                      (e.target.src =
                        'https://via.placeholder.com/400x200?text=Invalid+Image')
                    }
                  />
                </Box>
              )}
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/courses')}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Course'}
                </Button>
              </Box>
            </Grid>

          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateCourse;
