import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { healthAPI } from '../services/api';

const Sidebar = ({ isOpen, toggleMenu }) => {
  const location = useLocation();
  const [healthStatus, setHealthStatus] = useState({
    status: 'checking',
    database: 'unknown',
    lastCheck: null
  });

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  useEffect(() => {
    let isMounted = true;
    let checkInterval = null;

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
  }, []);

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
          Admin User<br />
          System Administrator
        </div>
      </div>
    </>
  );
};

export default Sidebar;