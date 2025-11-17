import React from 'react';

function Sidebar() {
  return (
    <div className="sidebar" style={{
      width: '250px',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h2>UniAttend</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ padding: '10px', cursor: 'pointer', borderRadius: '5px', marginBottom: '5px' }}>
          <a href="index.html" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</a>
        </li>

        <li style={{ padding: '10px', cursor: 'pointer', borderRadius: '5px', marginBottom: '5px' }}>
          <a href="users.html" style={{ textDecoration: 'none', color: 'inherit' }}>User Management</a>
        </li>
        <li style={{ padding: '10px', cursor: 'pointer', borderRadius: '5px', marginBottom: '5px' }}>
          <a href="venues.html" style={{ textDecoration: 'none', color: 'inherit' }}>Venues & Beacons</a>
        </li>
        <li className="active" style={{ 
          padding: '10px', 
          cursor: 'pointer', 
          borderRadius: '5px', 
          marginBottom: '5px',
          backgroundColor: '#d0d0d0'
        }}>
          Class Scheduling
        </li>
        <li style={{ padding: '10px', cursor: 'pointer', borderRadius: '5px', marginBottom: '5px' }}>
          <a href="reports.html" style={{ textDecoration: 'none', color: 'inherit' }}>Attendance Reports</a>
        </li>
      </ul>
      <h3>ADMIN</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ padding: '10px', cursor: 'pointer', borderRadius: '5px', marginBottom: '5px' }}>
          <a href="settings.html" style={{ textDecoration: 'none', color: 'inherit' }}>Settings</a>
        </li>
        <li style={{ padding: '10px', cursor: 'pointer', borderRadius: '5px', marginBottom: '5px' }}>
          <a href="security.html" style={{ textDecoration: 'none', color: 'inherit' }}>Security</a>
        </li>
      </ul>
      <div className="admin-user">
        <img 
          src="placeholder-user-avatar.png" 
          alt="Admin User" 
          style={{ width: '30px', borderRadius: '50%' }} 
        />
        Admin User<br />
        System Administrator
      </div>
    </div>
  );
}

export default Sidebar;

