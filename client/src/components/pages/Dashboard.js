import AssignmentIcon from '@mui/icons-material/Assignment';
import ClassIcon from '@mui/icons-material/Class';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchoolIcon from '@mui/icons-material/School';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography
} from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertContext from '../../context/alert/alertContext';
import AuthContext from '../../context/auth/authContext';
import api from '../../utils/api';
import setAuthToken from '../../utils/setAuthToken';

const Dashboard = () => {
  const authContext = useContext(AuthContext);
  const alertContext = useContext(AlertContext);
  const navigate = useNavigate();

  const { user, loading: authLoading, loadUser } = authContext;
  const { setAlert } = alertContext;

  const [stats, setStats] = useState({
    courses: 0,
    assignments: 0,
    completedAssignments: 0,
    students: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Load user if not loaded
  useEffect(() => {
    if (localStorage.token && !user) {
      loadUser();
    }
  }, [loadUser, user]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        if (localStorage.token) {
          setAuthToken(localStorage.token);
        }

        // Fetch courses
        const courseRes = await api.get('/api/courses');
        const courses = courseRes.data || [];

        let assignments = [];
        let completedAssignments = 0;
        let students = 0;

        if (user.role === 'teacher') {
          for (const course of courses) {
            try {
              const assignmentRes = await api.get(`/api/assignments/course/${course._id}`);
              if (assignmentRes.data && Array.isArray(assignmentRes.data)) {
                assignments = [...assignments, ...assignmentRes.data];
                completedAssignments += assignmentRes.data.filter(a => a.completed).length;
              }
              if (course.students && Array.isArray(course.students)) {
                students += course.students.length;
              }
            } catch (err) {
              console.error(`Error fetching data for course ${course._id}:`, err);
            }
          }
        } else {
          // Student view
          try {
            const assignmentRes = await api.get('/api/assignments');
            if (assignmentRes.data && Array.isArray(assignmentRes.data)) {
              assignments = assignmentRes.data;
              completedAssignments = assignments.filter(a => a.completed).length;
            }
            courses.forEach(course => {
              if (course.students && Array.isArray(course.students)) {
                students += course.students.length;
              }
            });
            if (students > 0) students--; // avoid counting self
          } catch (err) {
            console.error('Error fetching assignments:', err);
          }
        }

        setStats({
          courses: courses.length,
          assignments: assignments.length,
          completedAssignments,
          students
        });

        // Recent Activity
        const activityItems = [];

        const sortedAssignments = [...assignments].sort((a, b) =>
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        ).slice(0, 3);

        sortedAssignments.forEach(a => {
          const date = new Date(a.createdAt || a.date);
          activityItems.push({
            type: 'assignment',
            text: `Assignment: ${a.title}`,
            date: isNaN(date) ? 'Recent' : date.toLocaleDateString()
          });
        });

        const sortedCourses = [...courses].sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 1);

        sortedCourses.forEach(c => {
          const date = new Date(c.createdAt);
          activityItems.push({
            type: 'course',
            text: `Course: ${c.title}`,
            date: isNaN(date) ? 'Recent' : date.toLocaleDateString()
          });
        });

        setRecentActivity(activityItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
    else if (!authLoading) setLoading(false);
  }, [user, retryCount, authLoading]);

  const handleViewCourses = () => navigate('/courses');
  const handleRetry = () => setRetryCount(prev => prev + 1);

  if (authLoading || (loading && !error)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">
          You need to be logged in to view the dashboard.
          Please <Button color="inherit" onClick={() => navigate('/login')}>sign in</Button>.
        </Alert>
      </Container>
    );
  }

  const isTeacher = user.role === 'teacher';
  const progressPercent = stats.assignments > 0
    ? Math.round((stats.completedAssignments / stats.assignments) * 100)
    : 0;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Typography variant="subtitle1" gutterBottom>Welcome back, {user.name}!</Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRetry} startIcon={<RefreshIcon />}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Stats */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color="primary" gutterBottom>Overview</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <ClassIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h5">{stats.courses}</Typography>
                  <Typography variant="body2" color="text.secondary">Courses</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h5">{stats.assignments}</Typography>
                  <Typography variant="body2" color="text.secondary">Assignments</Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h5">{stats.students}</Typography>
                  <Typography variant="body2" color="text.secondary">{isTeacher ? 'Students' : 'Classmates'}</Typography>
                </Box>
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 3 }} fullWidth onClick={handleViewCourses}>
              View My Courses
            </Button>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color="primary" gutterBottom>Recent Activity</Typography>
            {recentActivity.length > 0 ? (
              <List sx={{ width: '100%' }}>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {activity.type === 'assignment' ? <AssignmentIcon /> : <SchoolIcon />}
                      </ListItemIcon>
                      <ListItemText primary={activity.text} secondary={activity.date} />
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>
                No recent activity to display.
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Teacher / Student Sections */}
        {isTeacher ? (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" color="primary" gutterBottom>Teacher Tools</Typography>
              <Grid container spacing={3}>
                {['Course Management', 'Assignment Creation', 'Student Progress'].map((title, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <Card sx={{ height: '100%' }}>
                      <CardHeader title={title} />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary">
                          {title === 'Course Management' && 'Create and manage courses, add materials, organize content.'}
                          {title === 'Assignment Creation' && 'Create assignments, quizzes, and assessments with AI-powered grading.'}
                          {title === 'Student Progress' && 'Track student performance, review submissions, provide feedback.'}
                        </Typography>
                        <Button onClick={() => navigate('/courses')} variant="outlined" sx={{ mt: 2 }} fullWidth>
                          {title === 'Course Management' ? 'Manage Courses' : title === 'Assignment Creation' ? 'Create Assignment' : 'View Student Progress'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ) : (
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" color="primary" gutterBottom>My Learning</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="Upcoming Assignments" />
                    <CardContent>
                      <Typography variant="body1" color="text.secondary">
                        {stats.assignments > 0 
                          ? `You have ${stats.assignments - stats.completedAssignments} assignment(s) pending.` 
                          : 'No upcoming assignments.'}
                      </Typography>
                      <Button onClick={() => navigate('/courses')} variant="outlined" sx={{ mt: 2 }} fullWidth>
                        View All Assignments
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardHeader title="My Progress" />
                    <CardContent>
                      <Typography variant="body2" gutterBottom>Overall Course Completion</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={progressPercent} 
                        sx={{ height: 10, borderRadius: 5, mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {progressPercent}% complete
                      </Typography>
                      <Button onClick={() => navigate('/courses')} variant="outlined" sx={{ mt: 2 }} fullWidth>
                        View Detailed Progress
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Button onClick={() => navigate('/courses/join')} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Join a New Course
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;
