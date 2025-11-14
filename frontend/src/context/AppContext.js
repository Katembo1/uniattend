import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../services/api';

// Create the context
const AppContext = createContext();

// Custom hook to use the AppContext
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// AppProvider component
export const AppProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]); // Track recent notifications for throttling

  // Process notification queue with delay
  useEffect(() => {
    if (notificationQueue.length > 0 && !isProcessingQueue) {
      setIsProcessingQueue(true);
      
      const processNext = () => {
        setNotificationQueue((queue) => {
          if (queue.length === 0) {
            setIsProcessingQueue(false);
            return queue;
          }

          const [next, ...rest] = queue;
          
          // Add the notification
          setNotifications((prev) => {
            const updated = [...prev, next];
            if (updated.length > 5) {
              return updated.slice(-5);
            }
            return updated;
          });

          // Auto-remove based on type
          const duration = next.type === 'error' ? 8000 : next.type === 'warning' ? 6000 : 5000;
          setTimeout(() => {
            removeNotification(next.id);
          }, duration);

          // Process next notification after delay
          if (rest.length > 0) {
            setTimeout(processNext, 500); // 500ms delay between notifications
          } else {
            setIsProcessingQueue(false);
          }

          return rest;
        });
      };

      processNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationQueue.length]); // Only depend on queue length, not the full queue

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          
          // Optionally, verify token with backend
          try {
            const response = await profileAPI.get();
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          } catch (error) {
            console.error('Token verification failed:', error);
            // If token is invalid, clear it
            logout();
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;

      // Save to localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      // Add success notification
      addNotification('Login successful!', 'success');

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      addNotification(message, 'error');
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Clear session storage
      sessionStorage.clear();

      // Clear state
      setUser(null);
      setIsAuthenticated(false);

      addNotification('Logged out successfully', 'info');
      
      // Redirect to login
      window.location.replace('/login');
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      const response = await profileAPI.update(data);
      const updatedUser = response.data;

      // Update localStorage and state
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      addNotification('Profile updated successfully', 'success');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      addNotification(message, 'error');
      return { success: false, error: message };
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add notification (queued with delay)
  const addNotification = (message, type = 'info') => {
    // Prevent duplicate notifications - check if same message already exists in queue or active notifications
    const isDuplicate = 
      notificationQueue.some(n => n.message === message && n.type === type) ||
      notifications.some(n => n.message === message && n.type === type);
    
    if (isDuplicate) {
      return; // Don't add duplicate notification
    }

    // Throttle identical notifications within 3 seconds
    const now = Date.now();
    const recentMatch = recentNotifications.find(
      n => n.message === message && n.type === type && (now - n.timestamp) < 3000
    );
    
    if (recentMatch) {
      return; // Don't add if same notification was added within last 3 seconds
    }

    const id = Date.now() + Math.random(); // Ensure unique ID
    const notification = { id, message, type };
    
    // Track this notification
    setRecentNotifications(prev => [
      ...prev.filter(n => (now - n.timestamp) < 3000), // Keep only recent ones
      { message, type, timestamp: now }
    ]);
    
    setNotificationQueue((prev) => [...prev, notification]);
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Context value
  const value = {
    // Authentication
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateProfile,

    // UI State
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,

    // Notifications
    notifications,
    addNotification,
    removeNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
