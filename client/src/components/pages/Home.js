import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/auth/authContext";
import ThemeContext from "../../context/ThemeContext";

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";

import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";


import AssignmentIcon from "@mui/icons-material/Assignment";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";

const Home = () => {
  const authContext = useContext(AuthContext);
  const { mode, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    if (localStorage.token) authContext.loadUser();
    // eslint-disable-next-line
  }, []);

  const features = [
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 60 }} />,
      title: "AI-Powered Grading",
      desc: "Automatically grade assignments using advanced AI technology.",
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 60 }} />,
      title: "Personalized Feedback",
      desc: "Provide detailed, constructive feedback tailored to each student.",
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 60 }} />,
      title: "Course Management",
      desc: "Easily create and manage courses and student enrollments.",
    },
    {
      icon: <AssignmentIcon sx={{ fontSize: 60 }} />,
      title: "Rubric System",
      desc: "Create detailed rubrics for clear assessment criteria.",
    },
  ];

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" position="relative">
      {/* Theme Toggle Button */}
      <Box sx={{ position: "absolute", top: 0, right: 19, zIndex: 1000 }}>
        <IconButton onClick={toggleTheme} color="inherit">
          {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Box>

      {/* Navbar */}

      {/* Main Content */}
      <Box
        component="main"
        flexGrow={1}
        sx={{
          width: "90%",
          maxWidth: 1200,
          mx: "auto",
          py: { xs: 4, sm: 6 },
        }}
      >
        {/* HERO SECTION */}
        <Box sx={{ textAlign: "center", px: 2 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Welcome to EduSphere
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            An AI-powered teaching assistant that automates grading and provides personalized feedback to help teachers save time and students learn better.
          </Typography>

          {authContext.isAuthenticated ? (
            <Button
              variant="contained"
              component={Link}
              to="/dashboard"
              size="large"
              sx={{ mt: 3, px: 4, py: 1.2 }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                component={Link}
                to="/register"
                size="large"
                sx={{ mr: 2, px: 4, py: 1.2 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/login"
                size="large"
                sx={{ px: 4, py: 1.2 }}
              >
                Login
              </Button>
            </Box>
          )}
        </Box>

        {/* FEATURES SECTION */}
        <Container maxWidth="lg" sx={{ mt: 10 }}>
          <Typography variant="h4" align="center" sx={{ mb: 5 }}>
            Features
          </Typography>

          <Grid container spacing={4}>
            {features.map((f, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: 4,
                    boxShadow: 4,
                    transition: "0.3s",
                    ":hover": { boxShadow: 10, transform: "translateY(-5px)" },
                  }}
                >
                  <CardMedia
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "center",
                      color: "primary.main",
                    }}
                  >
                    {f.icon}
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold">
                      {f.title}
                    </Typography>
                    <Typography sx={{ mt: 1 }} color="text.secondary">
                      {f.desc}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* SDG SECTION */}
        <Box
          sx={{
            bgcolor: "primary.light",
            p: 6,
            mt: 10,
            color: "white",
            textAlign: "center",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Supporting UN SDG 4: Quality Education
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 700, mx: "auto" }}>
            TeachAI Assistant helps make quality education more accessible and
            effective by reducing teacher workload and creating personalized
            learning experiences.
          </Typography>
        </Box>
      </Box>

      {/* Footer */}
    </Box>
  );
};

export default Home;
