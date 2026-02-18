import React from 'react';
import { Box, Container, Typography, Link, Grid, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={4}>
          {/* LEFT SECTION */}
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" color="primary">
                TeachAI Assistant
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary">
              AI-powered teacher assistant for automated grading and personalized feedback.
            </Typography>
          </Grid>

          {/* QUICK LINKS */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom>
              Quick Links
            </Typography>

            <Link href="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link href="/courses" color="inherit" display="block" sx={{ mb: 1 }}>
              Courses
            </Link>
            <Link href="/dashboard" color="inherit" display="block" sx={{ mb: 1 }}>
              Dashboard
            </Link>
          </Grid>

          {/* CONTACT */}
          <Grid item xs={12} sm={4}>
            <Typography variant="subtitle1" gutterBottom>
              Contact Us
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Email: support@teachai.edu
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Phone: +123 456 7890
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Address: 123 Education Lane, Learning City
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} TeachAI Assistant. All rights reserved.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Supporting UN SDG 4: Quality Education
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
