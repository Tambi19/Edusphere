import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';
import api from '../../utils/api';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setCourseLoading(true);

        const courseRes = await api.get(`/api/courses/${id}`);
        setCourse(courseRes.data.course);
        setStudents(courseRes.data.course.students || []);

        const assignmentsRes = await api.get(`/api/assignments/course/${id}`);
        setAssignments(assignmentsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to load course');
      } finally {
        setCourseLoading(false);
      }
    };

    if (id) fetchCourseData();
  }, [id]);

  const handleDeleteCourse = async () => {
    try {
      await api.delete(`/api/courses/${id}`);
      navigate('/courses');
    } catch {
      setError('Failed to delete course');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteAssignment = async assignmentId => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api.delete(`/api/assignments/${assignmentId}`);
      setAssignments(assignments.filter(a => a._id !== assignmentId));
    } catch {
      setError('Failed to delete assignment');
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm('Unenroll from this course?')) return;
    await api.put(`/api/courses/${id}/unenroll`);
    navigate('/courses');
  };

  if (loading || courseLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const isTeacher = user?.role === 'teacher';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/courses')}>
        Back
      </Button>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {course.title}
        </Typography>

        <Grid container spacing={1}>
          <Grid item>
            <Chip icon={<PersonIcon />} label={`Instructor: ${course.teacher.name}`} />
          </Grid>
          <Grid item>
            <Chip icon={<PeopleIcon />} label={`Students: ${students.length}`} />
          </Grid>
          <Grid item>
            <Chip icon={<AssignmentIcon />} label={`Assignments: ${assignments.length}`} />
          </Grid>
          <Grid item>
            <Chip
              icon={<CalendarTodayIcon />}
              label={`Created: ${new Date(course.createdAt).toLocaleDateString()}`}
            />
          </Grid>

          {/* ✅ COURSE CODE */}
          {isTeacher &&course.code && (
            <Grid item>
              <Chip
                label={`Course Code: ${course.code}`}
                color="primary"
                sx={{ fontWeight: 'bold' }}
              />
            </Grid>
          )}
        </Grid>

        {/* Actions */}
        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {isTeacher ? (
            <>
              <Button
                component={Link}
                to={`/assignments/create/${course._id}`}
                variant="contained"
              >
                Create Assignment
              </Button>

              <Button
                component={Link}
                to={`/courses/${course._id}/edit`}
                variant="outlined"
              >
                Edit Course
              </Button>

              {course.code && (
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => {
                    navigator.clipboard.writeText(course.code);
                    alert('Course code copied');
                  }}
                >
                  Copy Course Code
                </Button>
              )}

              <Button color="error" onClick={() => setDeleteDialogOpen(true)}>
                Delete Course
              </Button>
            </>
          ) : (
            <Button variant="contained" color="secondary" onClick={handleUnenroll}>
              Unenroll
            </Button>
          )}
        </Box>
      </Paper>

      {/* Assignments */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {assignments.length > 0 ? (
          assignments.map(a => (
            <Grid item xs={12} sm={6} md={4} key={a._id}>
              <Card>
                <CardHeader title={a.title} />
                <CardContent>
                  <Typography variant="body2">
                    {a.description || 'No description'}
                  </Typography>
                </CardContent>
                <CardActions>
  {isTeacher ? (
    <>
      <Button
        component={Link}
        to={`/assignments/${a._id}/edit`}
        size="small"
        variant="outlined"
      >
        Edit
      </Button>

      <Button
        color="error"
        size="small"
        variant="outlined"
        onClick={() => handleDeleteAssignment(a._id)}
      >
        Delete
      </Button>
    </>
  ) : (
    <>

      <Button
        component={Link}
        to={`/assignments/${a._id}/submit`}
        size="small"
        variant="outlined"
        color="success"
      >
        Submit
      </Button>
    </>
  )}
</CardActions>

              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">No assignments available.</Alert>
          </Grid>
        )}
      </Grid>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Course?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDeleteCourse}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CourseDetail;
