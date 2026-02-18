import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography
} from '@mui/material';

import AuthContext from '../../context/auth/authContext';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/courses');
        setCourses(res.data);
      } catch {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const isTeacher = user?.role === 'teacher';

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">My Courses</Typography>
        <Button
          variant="contained"
          onClick={() =>
            navigate(isTeacher ? '/courses/create' : '/courses/join')
          }
        >
          {isTeacher ? 'Create Course' : 'Join Course'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {courses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography>No courses found</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {courses.map(course => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 5,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={
                    course.imageUrl || 'https://via.placeholder.com/800x600'
                  }
                  alt={course.title}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>
                    {course.title}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {course.students?.length || 0} students
                  </Typography>

                  {/* ✅ COURSE CODE (TEACHER ONLY) */}
                  {isTeacher && course.code && (
                    <Chip
                      label={`Code: ${course.code}`}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  )}
                </CardContent>

                <CardActions>
                  <Button
                    fullWidth
                    onClick={() => navigate(`/courses/${course._id}`)}
                  >
                    View Course
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Courses;
