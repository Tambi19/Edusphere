import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Alert
} from '@mui/material';
import AuthContext from '../../context/auth/authContext';
import api from '../../utils/api';

const JoinCourse = () => {
  const navigate = useNavigate();
  const { user, loadUser } = useContext(AuthContext);

  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) navigate('/login');

      if (!user) await loadUser();
      if (user && user.role !== 'student') navigate('/dashboard');
    };

    init();
  }, [user, loadUser, navigate]);

  const onSubmit = async e => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await api.post('/api/courses/join', { code });
      setSuccess(`Joined course: ${res.data.title}`);
      setTimeout(() => navigate('/courses'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to join course');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4">Join Course</Typography>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Box component="form" onSubmit={onSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Course Code"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => navigate('/courses')} variant="outlined">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Joining...' : 'Join'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default JoinCourse;
