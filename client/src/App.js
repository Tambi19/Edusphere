// App.jsx
import { Box, Container, CssBaseline } from "@mui/material";
import { useEffect } from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import { CustomThemeProvider } from "./context/ThemeContext";


// Layout Components
import Alert from "./components/layout/Alert";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";

// Pages
import Dashboard from "./components/pages/Dashboard";
import Home from "./components/pages/Home";
import NotFound from "./components/pages/NotFound";
import Profile from "./components/pages/Profile";

// Auth
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Courses
import CourseDetail from "./components/courses/CourseDetail";
import Courses from "./components/courses/Courses";
import CreateCourse from "./components/courses/CreateCourse";
import EditCourse from "./components/courses/EditCourse";
import JoinCourse from "./components/courses/JoinCourse";

// Assignments
import AssignmentGrading from "./components/assignments/AIGrading";
import AssignmentSubmission from "./components/assignments/AssignmentSubmission";
import CreateAssignment from "./components/assignments/CreateAssignment";
import EditAssignment from "./components/assignments/EditAssignment";

// Students & Submissions
import StudentProgress from "./components/students/StudentProgress";
import SubmissionDetail from "./components/submissions/SubmissionDetail";

// Context Providers
import AlertState from "./context/alert/AlertState";
import AuthState from "./context/auth/AuthState";

// Utils
import ErrorBoundary from "./components/common/ErrorBoundary";
import PrivateRoute from "./components/routing/PrivateRoute";
import setAuthToken from "./utils/setAuthToken";


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
