import React, { useReducer, useEffect } from 'react';
import api from '../../utils/api';
import AuthContext from './authContext';
import authReducer from './authReducer';
import setAuthToken from '../../utils/setAuthToken';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
  UPDATE_USER,
  SET_LOADING
} from '../types';

const AuthState = props => {
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null,
    error: null
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
      loadUser();
    } else {
      dispatch({ type: SET_LOADING, payload: false });
    }
    // eslint-disable-next-line
  }, []);

  // Load user
  const loadUser = async () => {
    dispatch({ type: SET_LOADING, payload: true });

    try {
      const res = await api.get('/api/auth');

      dispatch({
        type: USER_LOADED,
        payload: res.data
      });
    } catch (err) {
      dispatch({ type: AUTH_ERROR });
    }
  };

  // Register
  const register = async formData => {
    dispatch({ type: SET_LOADING, payload: true });

    try {
      const res = await api.post('/api/users', formData);

      setAuthToken(res.data.token);

      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data
      });

      await loadUser();
      return { success: true };
    } catch (err) {
      dispatch({
        type: REGISTER_FAIL,
        payload: err.response?.data?.msg || 'Registration failed'
      });
      return { success: false };
    }
  };

  // Login
  const login = async formData => {
    dispatch({ type: SET_LOADING, payload: true });

    try {
      const res = await api.post('/api/auth', formData);

      setAuthToken(res.data.token);

      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data
      });

      await loadUser();
      return { success: true };
    } catch (err) {
      setAuthToken(null);
      dispatch({
        type: LOGIN_FAIL,
        payload: err.response?.data?.msg || 'Login failed'
      });
      return { success: false };
    }
  };

  // Update profile
  const updateUser = async formData => {
    try {
      const res = await api.put('/api/users/profile', formData);

      dispatch({
        type: UPDATE_USER,
        payload: res.data
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.msg || 'Update failed'
      };
    }
  };

  // Logout
  const logout = () => {
    setAuthToken(null);
    dispatch({ type: LOGOUT });
  };

  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        loadUser,
        login,
        logout,
        clearErrors,
        updateUser
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState;
