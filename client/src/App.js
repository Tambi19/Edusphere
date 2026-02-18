// App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, CssBaseline, Container } from "@mui/material";
import "./App.css";
import { CustomThemeProvider } from "./context/ThemeContext";


// Layout Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Alert from "./components/layout/Alert";

// Pages
import Home from "./components/pages/Home";
import Dashboard from "./components/pages/Dashboard";
import Profile from "./components/pages/Profile";
import NotFound from "./components/pages/NotFound";

// Auth
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";

// Courses
import Courses from "./components/courses/Courses";
import CourseDetail from "./components/courses/CourseDetail";
import CreateCourse from "./components/courses/CreateCourse";
import EditCourse from "./components/courses/EditCourse";
import JoinCourse from "./components/courses/JoinCourse";

// Assignments
import CreateAssignment from "./components/assignments/CreateAssignment";
import EditAssignment from "./components/assignments/EditAssignment";
import AssignmentSubmission from "./components/assignments/AssignmentSubmission";
import AssignmentGrading from "./components/assignments/AIGrading";

// Students & Submissions
import StudentProgress from "./components/students/StudentProgress";
import SubmissionDetail from "./components/submissions/SubmissionDetail";

// Context Providers
import AuthState from "./context/auth/AuthState";
import AlertState from "./context/alert/AlertState";

// Utils
import setAuthToken from "./utils/setAuthToken";
import PrivateRoute from "./components/routing/PrivateRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";


// Set token on load
if (localStorage.token) setAuthToken(localStorage.token);

const App = () => {

  // Optional: Log network reconnect/offline
  useEffect(() => {
    const handleOnline = () => {
      console.log("Back online");
      if (localStorage.token) setAuthToken(localStorage.token);
    };

    const handleOffline = () => console.log("You are offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);


  return (
    <CustomThemeProvider>   
    <AuthState>
      <AlertState>
        <Router>
          <CssBaseline />
          <ErrorBoundary>

            {/* Entire App Layout */}
            <Box display="flex" flexDirection="column" minHeight="100vh">
              
              {/* Navbar (responsive automatically with MUI) */}
              <Navbar />

              {/* Main Content */}
              <Box
                component="main"
                flexGrow={1}
                sx={{
                  py: 2,
                  width: "100%",
                }}
              >
                <Container maxWidth="md"> {/* Ensures responsive layout */}
                  <Alert />

                  <Routes>
                    {/* PUBLIC ROUTES */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* PRIVATE ROUTES */}
                    <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
                    <Route path="/profile" element={<PrivateRoute component={Profile} />} />

                    {/* Courses */}
                    <Route path="/courses" element={<PrivateRoute component={Courses} />} />
                    <Route path="/courses/create" element={<PrivateRoute component={CreateCourse} />} />
                    <Route path="/courses/join" element={<PrivateRoute component={JoinCourse} />} />
                    <Route path="/courses/:id" element={<PrivateRoute component={CourseDetail} />} />
                    <Route path="/courses/:id/edit" element={<PrivateRoute component={EditCourse} />} />

                    {/* Assignments */}
                    <Route path="/assignments/create/:courseId" element={<PrivateRoute component={CreateAssignment} />} />
                    <Route path="/assignments/:id/edit" element={<PrivateRoute component={EditAssignment} />} />
                    <Route path="/assignments/:id/submit" element={<PrivateRoute component={AssignmentSubmission} />} />
                    <Route path="/assignments/:id/grade" element={<PrivateRoute component={AssignmentGrading} />} />

                    {/* Students */}
                    <Route path="/students/:id/progress" element={<PrivateRoute component={StudentProgress} />} />

                    {/* Submissions */}
                    <Route path="/submissions/:id" element={<PrivateRoute component={SubmissionDetail} />} />

                    {/* Handle old URLs */}
                    <Route path="/index.html" element={<Navigate to="/" replace />} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>

                </Container>
              </Box>

              {/* Footer (responsive) */}
              <Footer />
            </Box>

          </ErrorBoundary>
        </Router>
      </AlertState>
    </AuthState>
    </CustomThemeProvider>
  );
};

export default App;
