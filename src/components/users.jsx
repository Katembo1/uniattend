import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/Styles.css';
import { FaUserCircle } from 'react-icons/fa';
function Users() {
    const [activeFilter, setActiveFilter] = useState('All Users');
    const [searchTerm, setSearchTerm] = useState('');

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const users = [
        { name: 'John Smith', id: 'STU2023001', course: 'Computer Science', role: 'Student', status: 'Active' },
        { name: 'Sarah Johnson', id: 'LEC2023042', course: 'Computer Science', role: 'Lecturer', status: 'Active' },
    ];

    const filteredUsers = users.filter(user => {
        if (activeFilter === 'All Users') return true;
        return user.role === activeFilter;
    }).filter(user => {
        return user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               user.id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="dashboard-container">
            {/* Sidebar Navigation - Only this navigation will be visible */}
            <div className="sidebar">
                <h2>UniAttend</h2>
                <ul>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li className="active">User Management</li>
                    <li><Link to="/venues">Venues & Beacons</Link></li>
                    <li><Link to="/scheduling">Class Scheduling</Link></li>
                    <li><Link to="/reports">Attendance Reports</Link></li>
                </ul>
                <h3>ADMIN</h3>

                <ul>
                    <li><Link to="/settings">Settings</Link></li>
                    <li><Link to="/security">Security</Link></li>
                    <li><Link to="/admin-profile">Admin Profile</Link></li>
                    <li><Link to="/admin-profile"><FaUserCircle size={30} /></Link></li>
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="content">
                {/* User Management Content */}
                <div className="user-management-content">
                    <div className="user-filters">
                    <Link to="/add-user" className="add-user-button">+ Add New User</Link>
                        {['All Users', 'Students', 'Lecturers', 'Admins'].map(filter => (
                            <button
                                key={filter}
                                className={`filter-button ${activeFilter === filter ? 'active' : ''}`}
                                onClick={() => handleFilterClick(filter.replace('s', ''))} // Remove 's' for Students/Lecturers/Admins to match data
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                        />
                    </div>

                    <div className="card">
  <div className="table-responsive">
    <table className="table users-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>ID/Number</th>
          <th>Course/Department</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.id}</td>
            <td>{user.course || user.department}</td>
            <td>
              <span className={`role-badge ${user.role.toLowerCase()}`}>
                {user.role}
              </span>
            </td>
            <td>
              <span className={`status-badge ${user.status.toLowerCase()}`}>
                {user.status}
              </span>
            </td>
            <td>
              <div className="table-actions">
                <button className="action-btn" title="Edit">
                  <span role="img" aria-label="Edit">✏️</span>
                </button>
                <button className="action-btn" title="View">
                  <span role="img" aria-label="View">👁️</span>
                </button>
                <button className="action-btn" title="Delete">
                  <span role="img" aria-label="Delete">🗑️</span>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Users;