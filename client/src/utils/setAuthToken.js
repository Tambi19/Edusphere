import api from './api';

// Optional: set request timeout
api.defaults.timeout = 10000; // 10 seconds

const setAuthToken = (token) => {
  if (token) {
    // Save token
    localStorage.setItem('token', token);

    // Attach token to all API requests
    api.defaults.headers.common['x-auth-token'] = token;

    console.log('Auth token set');
  } else {
    // Remove token
    localStorage.removeItem('token');

    // Remove header
    delete api.defaults.headers.common['x-auth-token'];

    console.log('Auth token removed');
  }
};

export default setAuthToken;
