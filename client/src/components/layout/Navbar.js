import React, { Fragment, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../../context/auth/authContext';

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Slide,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';

const Navbar = () => {
  const authContext = useContext(AuthContext);
  const { isAuthenticated, logout, user } = authContext;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = (state) => () => {
    setDrawerOpen(state);
  };

  const onLogout = () => {
    logout();
    setDrawerOpen(false);
  };

  const navLinks = [
    { title: 'Dashboard', path: '/dashboard' },
    { title: 'Courses', path: '/courses' },
    { title: 'Profile', path: '/profile' },
  ];

  const AuthButtons = () => (
    <Fragment>
      {isMobile ? (
        <>
          <IconButton
            color="inherit"
            onClick={toggleDrawer(true)}
            edge="end"
            sx={{
              p: 0.6,
              bgcolor: 'rgba(0, 0, 0, 0)',
              borderRadius: '50%',
              transition: '0.3s',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)', transform: 'scale(1.1)' },
            }}
          >
            {user?.profileImage ? (
              <Avatar src={user.profileImage} sx={{ width: 34, height: 34 }} />
            ) : (
              <MenuIcon />
            )}
          </IconButton>

          <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
            <Box sx={{ width: 250, p: 2 }}>
              {user && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                  <Avatar
                    src={user.profileImage}
                    sx={{ width: 60, height: 60, margin: 'auto', mb: 1 }}
                  />
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.role}
                  </Typography>
                </Box>
              )}
              <Divider />
              <List>
                {navLinks.map((link) => (
                  <ListItem key={link.title} disablePadding>
                    <ListItemButton
                      component={Link}
                      to={link.path}
                      onClick={toggleDrawer(false)}
                      sx={{
                        borderRadius: '8px',
                        mb: 1,
                        transition: '0.3s',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                        ...(location.pathname === link.path && {
                          bgcolor: 'rgba(0,0,0,0.1)',
                        }),
                      }}
                    >
                      <ListItemText primary={link.title} />
                    </ListItemButton>
                  </ListItem>
                ))}
                <ListItem disablePadding>
                  <ListItemButton onClick={onLogout} sx={{ borderRadius: '8px' }}>
                    Logout
                  </ListItemButton>
                </ListItem>
              </List>
            </Box>
          </Drawer>
        </>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user && (
            <Typography sx={{ opacity: 0.9 }}>
              Hello, {user.name} ({user.role})
            </Typography>
          )}

          {navLinks.map((link) => (
            <Button
              key={link.title}
              component={Link}
              to={link.path}
              sx={{
                ...navBtnStyle,
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  width: location.pathname === link.path ? '100%' : '0%',
                  height: '2px',
                  bottom: 0,
                  left: 0,
                  backgroundColor: '#ccc0c0',
                  transition: '0.3s',
                },
                '&:hover:after': {
                  width: '100%',
                },
              }}
            >
              {link.title}
            </Button>
          ))}

          <Button
            component={Link}
            to="/profile"
            sx={navBtnStyle}
            startIcon={
              user?.profileImage ? (
                <Avatar src={user.profileImage} sx={{ width: 22, height: 22 }} />
              ) : (
                <AccountCircleIcon />
              )
            }
          >
            Profile
          </Button>

          <Button onClick={onLogout} sx={navBtnStyle}>
            Logout
          </Button>
        </Box>
      )}
    </Fragment>
  );

  const GuestButtons = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: { xs: 1, sm: 2 }, // smaller gap mobile
    }}
  >
    <Button
      component={Link}
      to="/register"
      sx={{
        ...guestBtnStyle,
        fontSize: { xs: "13px", sm: "15px" },
        px: { xs: 1.5, sm: 2 },
      }}
    >
      Register
    </Button>

    <Button
      component={Link}
      to="/login"
      sx={{
        ...guestBtnStyle,
        fontSize: { xs: "13px", sm: "15px" },
        px: { xs: 1.5, sm: 2 },
      }}
    >
      Login
    </Button>
  </Box>
);


  return (
    <Slide direction="down" in={true} mountOnEnter unmountOnExit>
      <AppBar
  position="sticky"
  elevation={4}
  sx={{
    background: "linear-gradient(135deg, #4fa3e3, #3b82f6)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
  }}
>
  <Toolbar
  disableGutters
  sx={{
    height: 64,
    px: { xs: 2, sm: 4 }, // 🔥 smaller padding on mobile
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>



        <Box
  component={Link}
  to="/"
  sx={{
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  }}
>
  <Box
    component="img"
    src="/hero.png"
    alt="EduSphere Logo"
    sx={{
      height: { xs: 76, sm: 78 },  // 🔥 responsive sizing
      width: "auto",
      objectFit: "contain",
      display: "block",
    }}
  />
</Box>








          {isAuthenticated ? <AuthButtons /> : <GuestButtons />}
        </Toolbar>
      </AppBar>
    </Slide>
  );
};
const guestBtnStyle = {
  textTransform: "none",
  fontFamily: "'Poppins', sans-serif",
  fontWeight: 500,
  fontSize: "15px",
  color: "white",
  px: 2,
  py: 0.6,  
  borderRadius: "10px",
  border: "2px solid rgba(255,255,255,0.8)",
  backgroundColor: "transparent",
  
};


const navBtnStyle = {
  textTransform: 'none',
  fontFamily: "'Poppins', sans-serif",
  color: 'white',
  fontSize: '15px',
  px: 2,
  py: 0.6,
  borderRadius: '10px',
  transition: '0.25s',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'scale(1.05)' },
};

export default Navbar;
