import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const getActiveClass = (path) => {
    return location.pathname === path ? 'active' : '';
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
        `}
      </style>
      <div className="sidebar">
        <h2>UniAttend</h2>
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