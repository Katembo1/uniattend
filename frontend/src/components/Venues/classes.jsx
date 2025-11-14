import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Common/sidebar';
import { classAPI, timetableAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../css/Classes.css';

function Classes() {
    const [classes, setClasses] = useState([]);
    const [expandedRows, setExpandedRows] = useState([]); // Array to store rows with schedules
    const [loading, setLoading] = useState(true);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        per_page: 20
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const { addNotification } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        fetchClassesWithSchedules();
    }, [pagination.page]);

    const fetchClassesWithSchedules = async () => {
        try {
            setLoading(true);
            
            // Fetch classes
            const classResponse = await classAPI.getAll({
                page: pagination.page,
                per_page: pagination.per_page
            });
            
            // Fetch schedules
            const scheduleResponse = await timetableAPI.getAll();
            const schedules = scheduleResponse.data.items || [];
            
            // Create expanded rows: one row per venue-schedule combination
            const rows = [];
            const classItems = classResponse.data.items || [];
            
            classItems.forEach(classItem => {
                // Find all schedules for this class
                const classSchedules = schedules.filter(s => s.class?.class_id === classItem.class_id);
                
                if (classSchedules.length > 0) {
                    // Create a row for each schedule
                    classSchedules.forEach(schedule => {
                        rows.push({
                            ...classItem,
                            day: schedule.day_of_week,
                            time: `${schedule.start_time}-${schedule.end_time}`,
                            schedule_date: schedule.date || schedule.created_at,
                            schedule_id: schedule.timetable_id
                        });
                    });
                } else {
                    // If no schedule, still show the venue with "Not Scheduled"
                    rows.push({
                        ...classItem,
                        day: '-',
                        time: 'Not Scheduled',
                        schedule_date: null,
                        schedule_id: null
                    });
                }
            });
            
            setExpandedRows(rows);
            setPagination({
                page: classResponse.data.page,
                pages: classResponse.data.pages,
                total: classResponse.data.total,
                per_page: classResponse.data.per_page
            });
        } catch (error) {
            console.error('Error fetching classes:', error);
            addNotification(
                error.response?.data?.message || 'Failed to load classes',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const getFilteredClasses = () => {
        let filtered = expandedRows;

        // Filter by status
        if (filterStatus === 'active') {
            filtered = filtered.filter(cls => cls.is_active);
        } else if (filterStatus === 'inactive') {
            filtered = filtered.filter(cls => !cls.is_active);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(cls => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    cls.class_name?.toLowerCase().includes(searchLower) ||
                    cls.location?.toLowerCase().includes(searchLower) ||
                    cls.building?.toLowerCase().includes(searchLower) ||
                    cls.class_type?.toLowerCase().includes(searchLower)
                );
            });
        }

        return filtered;
    };

    const filteredClasses = getFilteredClasses();

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content classes-page">
                <div className="page-header">
                    <div className="header-content">
                        <button 
                            className="back-button" 
                            onClick={() => navigate('/dashboard')}
                            title="Back to Dashboard"
                        >
                            ← Back
                        </button>
                        <h1>All Classes & Venues</h1>
                    </div>
                    <div className="header-stats">
                        <span className="stat-item">
                            <strong>{pagination.total}</strong> Total Venues
                        </span>
                        <span className="stat-item">
                            <strong>{classes.filter(c => c.is_active).length}</strong> Active
                        </span>
                    </div>
                </div>

                <div className="classes-controls">
                    <div className="search-filter-group">
                        <input
                            type="text"
                            placeholder="Search by venue name, location, or building..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                    <div className="action-buttons">
                        <button 
                            className="btn btn-primary"
                            onClick={fetchClassesWithSchedules}
                            disabled={loading}
                        >
                            🔄 Refresh
                        </button>
                        <button 
                            className="btn btn-success"
                            onClick={() => navigate('/add_venue')}
                        >
                            ➕ Add Venue
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading classes and venues...</p>
                    </div>
                ) : filteredClasses.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏛️</div>
                        <h2>No Classes Found</h2>
                        <p>
                            {classes.length === 0 
                                ? "There are no venues/classes in the system yet."
                                : "No venues match your current filters. Try adjusting your search or filter criteria."}
                        </p>
                        {classes.length === 0 && (
                            <div className="empty-actions">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/add_venue')}
                                >
                                    Add First Venue
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table className="classes-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Building</th>
                                        <th>Type</th>
                                        <th>Capacity</th>
                                        <th>Status</th>
                                        <th>Day</th>
                                        <th>Time</th>
                                        <th>Date</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClasses.map((classItem, index) => (
                                        <tr key={`${classItem.class_id}-${classItem.schedule_id || index}`} className={!classItem.is_active ? 'inactive-row' : ''}>
                                            <td className="venue-name">
                                                <div className="name-cell">
                                                    <span className="icon">🏛️</span>
                                                    <span>{classItem.class_name}</span>
                                                </div>
                                            </td>
                                            <td>{classItem.building || 'N/A'}</td>
                                            <td>
                                                <span className="type-badge">
                                                    {classItem.class_type || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="capacity-cell">
                                                {classItem.capacity ? `${classItem.capacity} students` : 'N/A'}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${classItem.is_active ? 'active' : 'inactive'}`}>
                                                    {classItem.is_active ? '● Active' : '○ Inactive'}
                                                </span>
                                            </td>
                                            <td className="day-cell">
                                                <span className="day-badge">
                                                    {classItem.day}
                                                </span>
                                            </td>
                                            <td className="time-cell">
                                                {classItem.time}
                                            </td>
                                            <td className="date-cell">
                                                {classItem.schedule_date 
                                                    ? new Date(classItem.schedule_date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })
                                                    : '-'
                                                }
                                            </td>
                                            <td className="actions-cell" style={{ textAlign: 'center' }}>
                                                <button 
                                                    className="btn-icon view-btn"
                                                    onClick={() => {
                                                        setSelectedClass(classItem);
                                                        setShowViewModal(true);
                                                    }}
                                                    title="View Details"
                                                >
                                                    👁️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {pagination.pages > 1 && (
                            <div className="pagination-container">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                >
                                    ← Previous
                                </button>
                                <div className="pagination-info">
                                    <span>Page {pagination.page} of {pagination.pages}</span>
                                    <span className="pagination-count">
                                        Showing {expandedRows.length} schedule entries from {pagination.total} venues
                                    </span>
                                </div>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.pages}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* View Modal */}
                {showViewModal && selectedClass && (
                    <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Venue Details</h2>
                                <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="detail-row">
                                    <strong>Name:</strong> {selectedClass.class_name}
                                </div>
                                <div className="detail-row">
                                    <strong>Code:</strong> {selectedClass.class_code || 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Type:</strong> {selectedClass.class_type || 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Building:</strong> {selectedClass.building || 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Floor:</strong> {selectedClass.floor || 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Capacity:</strong> {selectedClass.capacity ? `${selectedClass.capacity} students` : 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Day:</strong> {selectedClass.day || 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Time:</strong> {selectedClass.time || 'Not Scheduled'}
                                </div>
                                <div className="detail-row">
                                    <strong>Date:</strong> {selectedClass.schedule_date 
                                        ? new Date(selectedClass.schedule_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })
                                        : 'N/A'
                                    }
                                </div>
                                <div className="detail-row">
                                    <strong>Description:</strong> {selectedClass.location_description || 'N/A'}
                                </div>
                                <div className="detail-row">
                                    <strong>Status:</strong> {selectedClass.is_active ? 'Active' : 'Inactive'}
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
            </div>
        </div>
    );
}

export default Classes;
