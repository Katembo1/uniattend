import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import '../css/Styles.css'
import Sidebar from '../Common/sidebar';
import { timetableAPI, institutionAPI, lecturerAPI, classAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

function Scheduling() {
    const [activeTab, setActiveTab] = useState('All Classes');
    const [searchTerm, setSearchTerm] = useState('');
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const { addNotification } = useApp();
    const MAX_RETRIES = 3;

    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    
    // Options for dropdowns
    const [units, setUnits] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [venues, setVenues] = useState([]);

    useEffect(() => {
        // Add a small delay to ensure auth token is available
        const initData = async () => {
            await fetchSchedule();
            await fetchDropdownData();
        };
        
        initData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Load once on mount

    const fetchDropdownData = async () => {
        try {
            const [unitsRes, lecturersRes, venuesRes] = await Promise.all([
                institutionAPI.units.getAll().catch(err => {
                    console.warn('Failed to fetch units:', err);
                    return { data: [] };
                }),
                lecturerAPI.getAll().catch(err => {
                    console.warn('Failed to fetch lecturers:', err);
                    return { data: [] };
                }),
                classAPI.getAll().catch(err => {
                    console.warn('Failed to fetch venues:', err);
                    return { data: [] };
                })
            ]);
            
            setUnits(unitsRes.data.items || unitsRes.data || []);
            setLecturers(lecturersRes.data.items || lecturersRes.data || []);
            setVenues(venuesRes.data.items || venuesRes.data || []);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            // Set empty arrays if all fail
            setUnits([]);
            setLecturers([]);
            setVenues([]);
        }
    };

    const fetchSchedule = async (isRetry = false) => {
        if (loading) return;
        
        if (isRetry && retryCount >= MAX_RETRIES) {
            addNotification('Maximum retry attempts reached', 'error');
            setClasses([]);
            return;
        }
        
        setLoading(true);

        try {
            const response = await timetableAPI.getAll();
            
            console.log('Schedule API response:', response.data);
            
            // Handle different response structures
            let scheduleItems = [];
            if (response.data) {
                if (Array.isArray(response.data)) {
                    scheduleItems = response.data;
                } else if (response.data.items) {
                    scheduleItems = response.data.items;
                }
            }
            
            // Transform API data to match display format
            const scheduleData = scheduleItems.map(entry => ({
                id: entry.timetable_id || entry.id,
                unitId: entry.unit_id,
                lecturerId: entry.lecturer_id,
                classId: entry.class_id,
                courseCode: entry.unit?.unit_code || entry.unit?.code || 'N/A',
                courseName: entry.unit?.unit_name || entry.unit?.name || 'N/A',
                instructor: entry.lecturer ? 
                    `${entry.lecturer.first_name || ''} ${entry.lecturer.last_name || ''}`.trim() || 'N/A' : 'N/A',
                venue: entry.class?.class_name || entry.class?.name || 'N/A',
                day: entry.day_of_week,
                dayName: entry.day_of_week || 'N/A',
                startTime: entry.start_time,
                endTime: entry.end_time,
                time: `${entry.start_time || 'N/A'}-${entry.end_time || 'N/A'}`,
                sessionType: entry.session_type || 'lecture',
                status: 'Active',
            }));
            
            setClasses(scheduleData);
            setRetryCount(0);
            
        } catch (error) {
            console.error('Error fetching schedule:', error);
            console.error('Error details:', error.response?.data);
            
            // Only show notification for actual errors, not timeouts during retry
            if (!isRetry || retryCount >= MAX_RETRIES - 1) {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to load schedule';
                addNotification(errorMsg, 'error');
            }
            
            // Set empty array on error
            setClasses([]);
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

    // View handler
    const handleView = (entry) => {
        setSelectedEntry(entry);
        setShowViewModal(true);
    };

    // Edit handlers
    const handleEdit = (entry) => {
        setSelectedEntry(entry);
        setEditFormData({
            unitId: entry.unitId || '',
            lecturerId: entry.lecturerId || '',
            venueId: entry.classId || '',
            dayOfWeek: entry.day || '',
            startTime: entry.startTime || '',
            endTime: entry.endTime || '',
            sessionType: entry.sessionType || 'lecture'
        });
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await timetableAPI.update(selectedEntry.id, editFormData);
            addNotification('Schedule updated successfully', 'success');
            setShowEditModal(false);
            fetchSchedule();
        } catch (error) {
            console.error('Error updating schedule:', error);
            console.error('Error details:', error.response?.data);
            addNotification(error.response?.data?.message || 'Failed to update schedule', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Delete handlers
    const handleDelete = (entry) => {
        setSelectedEntry(entry);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        
        try {
            await timetableAPI.delete(selectedEntry.id);
            addNotification('Schedule deleted successfully', 'success');
            setShowDeleteModal(false);
            fetchSchedule();
        } catch (error) {
            console.error('Error deleting schedule:', error);
            console.error('Error details:', error.response?.data);
            addNotification(error.response?.data?.message || 'Failed to delete schedule', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredClasses = classes.filter((cls) => {
        // First filter by search term
        const matchesSearch = Object.values(cls).some((value) =>
            value && typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (!matchesSearch) return false;
        
        // Then filter by active tab
        if (activeTab === 'All Classes') {
            return true;
        } else if (activeTab === 'Courses') {
            // Filter to show only courses (group by unit/course)
            return cls.courseCode && cls.courseName;
        } else if (activeTab === 'Schedules') {
            // Show all scheduled items
            return cls.day && cls.startTime;
        } else if (activeTab === 'Calendar View') {
            // For calendar view, show all with valid dates
            return cls.day && cls.startTime;
        }
        
        return true;
    });

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
                                {loading && classes.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                                            Loading schedule...
                                        </td>
                                    </tr>
                                ) : filteredClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No classes found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClasses.map((cls, index) => (
                                        <tr key={cls.id || index}>
                                            <td>{cls.courseCode}</td>
                                            <td>{cls.courseName}</td>
                                            <td>{cls.instructor}</td>
                                            <td>{cls.venue}</td>
                                            <td>{cls.dayName}</td>
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
                                                    <button 
                                                        className="action-btn" 
                                                        title="Edit"
                                                        onClick={() => handleEdit(cls)}
                                                        disabled={loading}
                                                    >
                                                        <span role="img" aria-label="Edit">📝</span>
                                                    </button>
                                                    <button 
                                                        className="action-btn" 
                                                        title="View"
                                                        onClick={() => handleView(cls)}
                                                    >
                                                        <span role="img" aria-label="View">👁️</span>
                                                    </button>
                                                    <button 
                                                        className="action-btn" 
                                                        title="Delete"
                                                        onClick={() => handleDelete(cls)}
                                                        disabled={loading}
                                                    >
                                                        <span role="img" aria-label="Delete">🗑️</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* View Modal */}
                {showViewModal && selectedEntry && (
                    <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Schedule Details</h2>
                                <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="detail-row">
                                    <strong>Course Code:</strong> {selectedEntry.courseCode}
                                </div>
                                <div className="detail-row">
                                    <strong>Course Name:</strong> {selectedEntry.courseName}
                                </div>
                                <div className="detail-row">
                                    <strong>Instructor:</strong> {selectedEntry.instructor}
                                </div>
                                <div className="detail-row">
                                    <strong>Venue:</strong> {selectedEntry.venue}
                                </div>
                                <div className="detail-row">
                                    <strong>Day:</strong> {selectedEntry.dayName}
                                </div>
                                <div className="detail-row">
                                    <strong>Time:</strong> {selectedEntry.time}
                                </div>
                                <div className="detail-row">
                                    <strong>Session Type:</strong> {selectedEntry.sessionType}
                                </div>
                                <div className="detail-row">
                                    <strong>Status:</strong> {selectedEntry.status}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && selectedEntry && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit Schedule</h2>
                                <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Unit</label>
                                        <select
                                            name="unitId"
                                            value={editFormData.unitId}
                                            onChange={handleEditChange}
                                            required
                                            className="form-control"
                                        >
                                            <option value="">Select Unit</option>
                                            {units.map(unit => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.code} - {unit.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Lecturer</label>
                                        <select
                                            name="lecturerId"
                                            value={editFormData.lecturerId}
                                            onChange={handleEditChange}
                                            required
                                            className="form-control"
                                        >
                                            <option value="">Select Lecturer</option>
                                            {lecturers.map(lecturer => (
                                                <option key={lecturer.lecturer_id} value={lecturer.lecturer_id}>
                                                    {lecturer.first_name} {lecturer.last_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Venue</label>
                                        <select
                                            name="venueId"
                                            value={editFormData.venueId}
                                            onChange={handleEditChange}
                                            required
                                            className="form-control"
                                        >
                                            <option value="">Select Venue</option>
                                            {venues.map(venue => (
                                                <option key={venue.id} value={venue.id}>
                                                    {venue.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Day of Week</label>
                                        <select
                                            name="dayOfWeek"
                                            value={editFormData.dayOfWeek}
                                            onChange={handleEditChange}
                                            required
                                            className="form-control"
                                        >
                                            <option value="">Select Day</option>
                                            <option value="Monday">Monday</option>
                                            <option value="Tuesday">Tuesday</option>
                                            <option value="Wednesday">Wednesday</option>
                                            <option value="Thursday">Thursday</option>
                                            <option value="Friday">Friday</option>
                                            <option value="Saturday">Saturday</option>
                                            <option value="Sunday">Sunday</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Start Time</label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={editFormData.startTime}
                                            onChange={handleEditChange}
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>End Time</label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={editFormData.endTime}
                                            onChange={handleEditChange}
                                            required
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Session Type</label>
                                        <select
                                            name="sessionType"
                                            value={editFormData.sessionType}
                                            onChange={handleEditChange}
                                            required
                                            className="form-control"
                                        >
                                            <option value="lecture">Lecture</option>
                                            <option value="lab">Lab</option>
                                            <option value="tutorial">Tutorial</option>
                                            <option value="practical">Practical</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowEditModal(false)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedEntry && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Confirm Delete</h2>
                                <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this schedule entry?</p>
                                <div className="detail-row">
                                    <strong>{selectedEntry.courseCode}</strong> - {selectedEntry.courseName}
                                </div>
                                <div className="detail-row">
                                    {selectedEntry.dayName} at {selectedEntry.time}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-danger" 
                                    onClick={confirmDelete}
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Scheduling;

