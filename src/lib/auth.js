import { useStore } from './store';
import axios from 'axios';

// Update this to your actual API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Authentication utilities to handle login, signup, and token management
 */
export const AuthService = {
  /**
   * Login a user and store their session
   * @param {Object} credentials - Email and password
   * @returns {Promise} - User data or error
   */
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
      
      // Match the backend response format: { token, user: { id, email, username } }
      if (response.data.token && response.data.user) {
        // Store user data and token in the global store
        useStore.getState().login(response.data.user, response.data.token);
        
        // Set Authorization header for future requests
        setAuthHeader(response.data.token);
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data (username, email, password, walletAddress, userType)
   * @returns {Promise} - User data or error
   */
  signup: async (userData) => {
    // Ensure we have the correct fields for the backend
    const signupData = {
      username: userData.name || userData.username, // Support both name and username
      email: userData.email,
      password: userData.password,
      walletAddress: userData.walletAddress || null,
      userType: userData.userType || 'buyer'  // Default to buyer if not specified
    };
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, signupData);
      
      // Match the backend response format: { token, user: { id, email, username } }
      if (response.data.token && response.data.user) {
        // Add userType to the user object if it was provided in signup
        const user = {
          ...response.data.user,
          userType: userData.userType || 'buyer', // Default to buyer if not specified
          walletAddress: userData.walletAddress || ''
        };
        
        // Store user data and token in the global store
        useStore.getState().login(user, response.data.token);
        
        // Set Authorization header for future requests
        setAuthHeader(response.data.token);
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },
  
  /**
   * Update user profile
   * @param {Object} userData - User profile data to update (userType, walletAddress)
   * @returns {Promise} - Updated user data or error
   */
  updateProfile: async (userData) => {
    try {
      const token = useStore.getState().auth.token;
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }
      
      // Set Authorization header for request
      setAuthHeader(token);
      
      // Use POST instead of PUT to match the backend route
      const response = await axios.post(`${API_BASE_URL}/api/users/profile`, userData);
      
      if (response.data) {
        // The backend returns only userType and walletAddress, we need to create a proper user object
        const currentUser = useStore.getState().auth.user;
        
        // Update only the user object with userType and walletAddress
        const updatedUser = {
          ...currentUser,
          userType: response.data.user?.userType || response.data.userType || currentUser.userType,
          walletAddress: response.data.user?.walletAddress || currentUser.walletAddress
        };
        
        // Update the user in the store
        useStore.getState().updateUser(updatedUser);
        
        return { 
          success: true, 
          data: { 
            user: updatedUser 
          } 
        };
      }
      
      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.response?.data?.msg || 'Profile update failed' 
      };
    }
  },
  
  /**
   * Log out the current user
   */
  logout: () => {
    useStore.getState().logout();
    removeAuthHeader();
    // Additional logout logic (e.g., redirect) can be handled by the component
  },
  
  /**
   * Check if the current session is valid
   * @returns {Promise} - Boolean indicating if session is valid
   */
  validateSession: async () => {
    try {
      const token = useStore.getState().auth.token;
      
      if (!token) {
        return false;
      }
      
      // Set the token in headers
      setAuthHeader(token);
      
      // Verify the token with the backend
      const response = await axios.get(`${API_BASE_URL}/auth/verify`);
      return response.data.valid === true;
    } catch (error) {
      console.error('Session validation error:', error);
      AuthService.logout(); // Clear invalid session
      return false;
    }
  }
};

/**
 * Set the authentication token in axios headers
 * @param {string} token - JWT token
 */
export const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

/**
 * Remove the authentication header
 */
export const removeAuthHeader = () => {
  delete axios.defaults.headers.common['Authorization'];
};

/**
 * Check if user is authenticated and redirect if not
 * For use in client components or page loaders
 */
export const requireAuth = async (router) => {
  const isAuthenticated = useStore.getState().auth.isAuthenticated;
  const token = useStore.getState().auth.token;
  
  if (!isAuthenticated || !token) {
    if (router) {
      router.push('/login');
    }
    return false;
  }
  
  // Optional: validate the token on the backend
  const isValid = await AuthService.validateSession();
  if (!isValid && router) {
    router.push('/login');
    return false;
  }
  
  return true;
};