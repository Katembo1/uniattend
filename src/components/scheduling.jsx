import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './css/Styles.css'

import { FaUserCircle } from 'react-icons/fa';
function Scheduling() {
    const [activeTab, setActiveTab] = useState('All Classes');
    const [searchTerm, setSearchTerm] = useState('');
    const [classes, setClasses] = useState([
        {
            courseCode: 'CS101',
            courseName: 'Introduction to Programming',
            instructor: 'Dr. Smith',
            venue: 'Lecture Hall A',
            day: 'Monday',
            time: '09:00-10:30',
            status: 'Active',
        },
        {
            courseCode: 'MATH201',
            courseName: 'Calculus II',
            instructor: 'Prof. Johnson',
            venue: 'Lecture Hall A',
            day: 'Tuesday',
            time: '11:00-12:30',
            status: 'Active',
        },
        {
            courseCode: 'CS202',
            courseName: 'Data Structures',
            instructor: 'Dr. Williams',
            venue: 'Computer Lab 101',
            day: 'Wednesday',
            time: '14:00-15:30',
            status: 'Active',
        },
        {
            courseCode: 'ENG101',
            courseName: 'English Composition',
            instructor: 'Prof. Davis',
            venue: 'Seminar Room 203',
            day: 'Thursday',
            time: '10:00-11:30',
            status: 'Active',
        },
        {
            courseCode: 'PHYS101',
            courseName: 'Physics I',
            instructor: 'Dr. Brown',
            venue: 'Lecture Hall A',
            day: 'Friday',
            time: '13:00-14:30',
            status: 'Active',
        },
        {
            courseCode: 'CS301',
            courseName: 'Database Systems',
            instructor: 'Prof. Miller',
            venue: 'Computer Lab 101',
            day: 'N/A',
            time: 'N/A',
            status: 'N/A',
        },
    ]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredClasses = classes.filter((cls) =>
        Object.values(cls).some((value) =>
            value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="app-container">
            <div className="sidebar">
                <h2>UniAttend</h2>
                <ul>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/users">User Management</Link></li>
                    <li><Link to="/venues">Venues & Beacons</Link></li>
                    <li className="active">Class Scheduling</li>
                    <li><Link to="/reports">Attendance Reports</Link></li>
                </ul>
                <h3>ADMIN</h3>
                <ul>
                    <li><Link to="/settings">Settings</Link></li>
                    <li><Link to="/security">Security</Link></li>
                    <li><Link to="/admin-profile">Admin Profile</Link></li>
                </ul>
                <div className="admin-user">
                <FaUserCircle size={30} />
          Admin User<br />
          System Administrator
        </div>
            </div>
            <div className="content">
                <div className="breadcrumbs">
                    <Link to="/dashboard">Dashboard</Link> <span>&gt;</span> Class Scheduling
                </div>
                
                <div className="page-header">
                    <h1 className="page-title">Class Scheduling</h1>
                    <div className="header-actions">
                    <Link to="/add-class" className="btn btn-primary">
                            Add New Class
                        </Link>
                        <Link to="/scheduleimport" className="btn btn-secondary">
                            Import Schedule
                        </Link>
                    </div>
                </div>
                
                <div className="card">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${activeTab === 'All Classes' ? 'active' : ''}`}
                            onClick={() => handleTabClick('All Classes')}
                        >
                            All Classes
                        </button>
                        <button
                            className={`filter-tab ${activeTab === 'Courses' ? 'active' : ''}`}
                            onClick={() => handleTabClick('Courses')}
                        >
                            Courses
                        </button>
                        <button
                            className={`filter-tab ${activeTab === 'Schedules' ? 'active' : ''}`}
                            onClick={() => handleTabClick('Schedules')}
                        >
                            Schedules
                        </button>
                        <button
                            className={`filter-tab ${activeTab === 'Calendar View' ? 'active' : ''}`}
                            onClick={() => handleTabClick('Calendar View')}
                        >
                            Calendar View
                        </button>
                    </div>
                    
                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Search classes..." 
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                            className="search-input"
                        />
                        <button className="search-btn">🔍</button>
                    </div>
                    
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Course Code</th>
                                    <th>Course Name</th>
                                    <th>Instructor</th>
                                    <th>Venue</th>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.map((cls, index) => (
                                    <tr key={index}>
                                        <td>{cls.courseCode}</td>
                                        <td>{cls.courseName}</td>
                                        <td>{cls.instructor}</td>
                                        <td>{cls.venue}</td>
                                        <td>{cls.day}</td>
                                        <td>{cls.time}</td>
                                        <td>
                                            <span className={`badge ${
                                                cls.status === 'Active' ? 'badge-success' : 
                                                cls.status === 'N/A' ? 'badge-warning' : 'badge-danger'
                                            }`}>
                                                {cls.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="action-btn" title="Edit">
                                                    <span role="img" aria-label="Edit">📝</span>
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
    );
}

export default Scheduling;