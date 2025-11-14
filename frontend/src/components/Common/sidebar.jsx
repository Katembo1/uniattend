import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { healthAPI, authAPI } from '../../services/api';

const Sidebar = ({ isOpen, toggleMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState({
    status: 'checking',
    database: 'unknown',
    lastCheck: null
  });
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  useEffect(() => {
    let isMounted = true;
    let checkInterval = null;

    // Check authentication status
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing user data:', e);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    const checkHealth = async () => {
      try {
        const response = await healthAPI.check();
        if (isMounted) {
          setHealthStatus({
            status: 'healthy',
            database: response.data.database,
            lastCheck: new Date().toLocaleTimeString()
          });
        }
      } catch (error) {
        if (isMounted) {
          setHealthStatus({
            status: 'error',
            database: 'disconnected',
            lastCheck: new Date().toLocaleTimeString()
          });
        }
      }
    };

    // Initial check
    checkHealth();

    // Check every 30 seconds
    checkInterval = setInterval(checkHealth, 30000);

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and redirect
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'Guest User';
    
    // Try to get name from admin_profile or user object
    if (user.admin_profile) {
      const { first_name, last_name } = user.admin_profile;
      const name = `${first_name || ''} ${last_name || ''}`.trim();
      return name || user.username || user.email;
    }
    
    return user.username || user.email || 'Admin User';
  };

  const getUserRole = () => {
    if (!user) return 'Not Logged In';
    
    if (user.admin_profile?.admin_role) {
      return user.admin_profile.admin_role;
    }
    
    return user.user_type === 'admin' ? 'System Administrator' : user.user_type;
  };

  return (
    <>
      <style>
        {`
:root {
  --primary-color: #007bff;
  --primary-hover: #0069d9;
  --warning-color: #ffc107;
  --warning-hover: #e0a800;
  --sidebar-bg: #333;
  --sidebar-text: white;
  --light-bg: #f8f9fa;
  --light-border: #e9ecef;
  --text-color: #333;
  --text-light: #6c757d;
  --success-bg: #d4edda;
  --success-text: #155724;
  --danger-bg: #f8d7da;
  --danger-text: #721c24;
}

        .sidebar {
            width: 250px;
            background-color: var(--sidebar-bg);
            color: var(--sidebar-text);
            padding: 20px;
            height: 100vh;
            display: flex;
            flex-direction: column;
            box-shadow: 2px 0 5px rgba(0,0,0,0.2);
            font-family: 'Arial', sans-serif;
            position: fixed;
            left: 0;
            top: 0;
            z-index: 1000;
            transition: transform 0.3s ease-in-out;
        }

        .sidebar h2 {
            color: var(--sidebar-text);
            margin-bottom: 15px;
            font-size: 1.5rem;
        }

        .sidebar h3 {
            font-size: 1rem;
            font-weight: 500;
            color: rgba(255,255,255,0.7);
            margin-top: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0 0 15px 0;
        }

        .sidebar ul li a {
            display: block;
            padding: 5px 10px;
            color: var(--sidebar-text);
            text-decoration: none;
            border-radius: 8px;
            margin-bottom: 2px;
            transition: background-color 0.2s, color 0.2s;
        }

        .sidebar ul li a:hover {
            background-color: #34495e;
            color: #ecf0f1;
        }

        .sidebar ul li a.active {
          background-color: var(--warning-color);
        border-left: 5px solid var(--warning-color);
        color: var(--text-color);
        font-weight: bold;
        }

        .admin-user {
            margin-top: auto;
            padding-top: 20px;
            border-top: 1px solid #34495e;
            text-align: center;
            font-size: 0.9rem;
            color: #bdc3c7;
        }

        .health-status {
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 8px;
            font-size: 0.85rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background-color: rgba(255, 255, 255, 0.1);
        }

        .health-status.healthy {
            background-color: rgba(40, 167, 69, 0.2);
            border: 1px solid #28a745;
        }

        .health-status.error {
            background-color: rgba(220, 53, 69, 0.2);
            border: 1px solid #dc3545;
        }

        .health-status.checking {
            background-color: rgba(255, 193, 7, 0.2);
            border: 1px solid #ffc107;
        }

        .health-status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }

        .health-status.healthy .health-status-indicator {
            background-color: #28a745;
        }

        .health-status.error .health-status-indicator {
            background-color: #dc3545;
        }

        .health-status.checking .health-status-indicator {
            background-color: #ffc107;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        .health-status-text {
            flex: 1;
            text-align: left;
        }

        .health-status-time {
            font-size: 0.75rem;
            opacity: 0.7;
        }

        /* Mobile responsive styles */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }
            
            .sidebar.open {
                transform: translateX(0);
            }
        }

        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }

        @media (max-width: 768px) {
            .sidebar-overlay.visible {
                display: block;
            }
        }
        `}
      </style>
      
      {/* Overlay for mobile - clicking it closes the sidebar */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={toggleMenu}
      />
      
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2>UniAttend</h2>
        
        {/* Health Status Indicator */}
        <div className={`health-status ${healthStatus.status}`}>
          <div className="health-status-text">
            <span className="health-status-indicator"></span>
            {healthStatus.status === 'healthy' && 'Backend Connected'}
            {healthStatus.status === 'error' && 'Backend Disconnected'}
            {healthStatus.status === 'checking' && 'Checking...'}
          </div>
          {healthStatus.lastCheck && (
            <div className="health-status-time">{healthStatus.lastCheck}</div>
          )}
        </div>
        
        <ul>
          <li><Link to='/dashboard' className={getActiveClass('/dashboard')}>Dashboard</Link></li>
          <li><Link to="/users" className={getActiveClass('/users')}>User Management</Link></li>
          <li><Link to="/venues" className={getActiveClass('/venues')}>Venues & Beacons</Link></li>
          <li><Link to="/scheduling" className={getActiveClass('/scheduling')}>Class Scheduling</Link></li>
          <li><Link to="/reports" className={getActiveClass('/reports')}>Attendance Reports</Link></li>
        </ul>
        <h3>ADMIN</h3>
        <ul>
          <li><Link to="/settings" className={getActiveClass('/settings')}>Settings</Link></li>
          <li><Link to="/security" className={getActiveClass('/security')}>Security</Link></li>
          <li><Link to="/admin-profile" className={getActiveClass('/admin-profile')}>Admin Profile</Link></li>
        </ul>
        
        <div className="admin-user">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ width: '30px', height: '30px', margin: '0 auto 5px', color: '#95a5a6', display: 'block' }}>
            <path fill="currentColor" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3c0 16.2 13.1 29.7 29.7 29.7H418.3c16.2 0 29.7-13.1 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
          </svg>
          <div style={{ marginBottom: '5px' }}>
            {getUserDisplayName()}<br />
            <span style={{ fontSize: '0.85em', opacity: 0.8 }}>{getUserRole()}</span>
          </div>
          
          {/* Auth Status Indicator */}
          <div style={{ 
            fontSize: '0.75em', 
            padding: '4px 8px', 
            marginTop: '8px',
            borderRadius: '3px',
            backgroundColor: isAuthenticated ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)',
            color: isAuthenticated ? '#2ecc71' : '#e74c3c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isAuthenticated ? '#2ecc71' : '#e74c3c',
              display: 'inline-block'
            }}></span>
            {isAuthenticated ? 'Authenticated' : 'Not Logged In'}
          </div>
          
          {/* Login/Logout Button */}
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #e74c3c',
                color: '#e74c3c',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85em',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#e74c3c';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#e74c3c';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: '12px', height: '12px', marginRight: '5px', verticalAlign: 'middle' }}>
                <path fill="currentColor" d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"/>
              </svg>
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              style={{
                display: 'block',
                width: '100%',
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: '1px solid #3498db',
                color: '#3498db',
                borderRadius: '4px',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: '0.85em',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#3498db';
                e.target.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#3498db';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={{ width: '12px', height: '12px', marginRight: '5px', verticalAlign: 'middle' }}>
                <path fill="currentColor" d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"/>
              </svg>
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;


