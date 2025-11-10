import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import './css/Styles.css'
import Sidebar from './sidebar';
import { timetableAPI } from '../services/api';
import { useApp } from '../context/AppContext';

function Scheduling() {
    const [activeTab, setActiveTab] = useState('All Classes');
    const [searchTerm, setSearchTerm] = useState('');
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const { addNotification } = useApp();
    const MAX_RETRIES = 3;

    useEffect(() => {
        fetchSchedule();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Load once on mount

    const fetchSchedule = async (isRetry = false) => {
        if (loading) return;
        
        if (isRetry && retryCount >= MAX_RETRIES) {
            addNotification('Maximum retry attempts reached', 'error');
            return;
        }
        
        setLoading(true);
        const timeoutId = setTimeout(() => {
            console.error('Schedule fetch timeout');
            setLoading(false);
            if (retryCount < MAX_RETRIES) {
                addNotification('Request timeout - retrying...', 'warning');
                setRetryCount(prev => prev + 1);
            }
        }, 8000);

        try {
            const response = await timetableAPI.getAll();
            clearTimeout(timeoutId);
            
            // Transform API data to match display format
            const scheduleData = (response.data.items || response.data || []).map(entry => ({
                courseCode: entry.unit?.code || 'N/A',
                courseName: entry.unit?.name || 'N/A',
                instructor: entry.lecturer?.user?.first_name + ' ' + entry.lecturer?.user?.last_name || 'N/A',
                venue: entry.class?.name || 'N/A',
                day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][entry.day_of_week] || 'N/A',
                time: `${entry.start_time}-${entry.end_time}`,
                status: 'Active',
            }));
            
            setClasses(scheduleData);
            setRetryCount(0);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Error fetching schedule:', error);
            
            if (retryCount < MAX_RETRIES) {
                addNotification(`Failed to load schedule - Retry ${retryCount + 1}/${MAX_RETRIES}`, 'warning');
                setRetryCount(prev => prev + 1);
                setTimeout(() => fetchSchedule(true), 2000);
            } else {
                addNotification('Failed to load schedule', 'error');
                // Set empty array on final failure
                setClasses([]);
            }
        } finally {
            setLoading(false);
        }
    };

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
          <Sidebar/>
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