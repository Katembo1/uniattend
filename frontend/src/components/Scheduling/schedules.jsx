import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Common/sidebar';
import { timetableAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../css/Schedules.css';

function Schedules() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        per_page: 20
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDay, setFilterDay] = useState('all');
    const { addNotification } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        fetchSchedules();
    }, [pagination.page]);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const response = await timetableAPI.getAll({
                page: pagination.page,
                per_page: pagination.per_page
            });

            setSchedules(response.data.items || []);
            setPagination({
                page: response.data.page,
                pages: response.data.pages,
                total: response.data.total,
                per_page: response.data.per_page
            });
        } catch (error) {
            console.error('Error fetching schedules:', error);
            addNotification(
                error.response?.data?.message || 'Failed to load schedules',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time) => {
        if (!time) return 'N/A';
        return time;
    };

    const getDayColor = (day) => {
        const colors = {
            'Monday': 'day-mon',
            'Tuesday': 'day-tue',
            'Wednesday': 'day-wed',
            'Thursday': 'day-thu',
            'Friday': 'day-fri',
            'Saturday': 'day-sat',
            'Sunday': 'day-sun'
        };
        return colors[day] || 'day-default';
    };

    const getFilteredSchedules = () => {
        let filtered = schedules;

        // Filter by day
        if (filterDay !== 'all') {
            filtered = filtered.filter(schedule => schedule.day_of_week === filterDay);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(schedule => {
                const searchLower = searchTerm.toLowerCase();
                const unitCode = schedule.unit?.unit_code?.toLowerCase() || '';
                const unitName = schedule.unit?.unit_name?.toLowerCase() || '';
                const className = schedule.class?.class_name?.toLowerCase() || '';
                const lecturerName = schedule.lecturer?.name?.toLowerCase() || '';
                
                return (
                    unitCode.includes(searchLower) ||
                    unitName.includes(searchLower) ||
                    className.includes(searchLower) ||
                    lecturerName.includes(searchLower)
                );
            });
        }

        return filtered;
    };

    const filteredSchedules = getFilteredSchedules();

    // Group schedules by day
    const groupedByDay = filteredSchedules.reduce((acc, schedule) => {
        const day = schedule.day_of_week || 'Unassigned';
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(schedule);
        return acc;
    }, {});

    // Sort days
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Unassigned'];
    const sortedDays = Object.keys(groupedByDay).sort((a, b) => {
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content schedules-page">
                <div className="page-header">
                    <div className="header-content">
                        <button 
                            className="back-button" 
                            onClick={() => navigate('/dashboard')}
                            title="Back to Dashboard"
                        >
                            ← Back
                        </button>
                        <h1>Class Schedules</h1>
                    </div>
                    <div className="header-stats">
                        <span className="stat-item">
                            <strong>{pagination.total}</strong> Total Classes
                        </span>
                    </div>
                </div>

                <div className="schedules-controls">
                    <div className="search-filter-group">
                        <input
                            type="text"
                            placeholder="Search by unit, venue, or lecturer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <select
                            value={filterDay}
                            onChange={(e) => setFilterDay(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Days</option>
                            <option value="Monday">Monday</option>
                            <option value="Tuesday">Tuesday</option>
                            <option value="Wednesday">Wednesday</option>
                            <option value="Thursday">Thursday</option>
                            <option value="Friday">Friday</option>
                            <option value="Saturday">Saturday</option>
                            <option value="Sunday">Sunday</option>
                        </select>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={fetchSchedules}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading schedules...</p>
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📅</div>
                        <h2>No Schedules Found</h2>
                        <p>
                            {schedules.length === 0 
                                ? "There are no schedules in the timetable yet."
                                : "No schedules match your current filters. Try adjusting your search or filter criteria."}
                        </p>
                        {schedules.length === 0 && (
                            <div className="empty-actions">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/scheduling')}
                                >
                                    Create Schedule
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="schedules-list">
                            {sortedDays.map((day) => (
                                <div key={day} className="day-section">
                                    <h2 className={`day-header ${getDayColor(day)}`}>
                                        {day}
                                        <span className="day-count">{groupedByDay[day].length} classes</span>
                                    </h2>
                                    <div className="schedule-cards">
                                        {groupedByDay[day]
                                            .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                                            .map((schedule) => (
                                                <div key={schedule.timetable_id} className="schedule-card">
                                                    <div className="schedule-time">
                                                        <div className="time-badge">
                                                            🕐 {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                                        </div>
                                                        {schedule.session_type && (
                                                            <span className={`session-type ${schedule.session_type.toLowerCase()}`}>
                                                                {schedule.session_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="schedule-content">
                                                        <h3 className="schedule-title">
                                                            {schedule.unit?.unit_code || 'N/A'}: {schedule.unit?.unit_name || 'Unknown Unit'}
                                                        </h3>
                                                        <div className="schedule-meta">
                                                            <div className="meta-item">
                                                                <span className="meta-icon">🏛️</span>
                                                                <span>{schedule.class?.class_name || 'TBA'}</span>
                                                            </div>
                                                            <div className="meta-item">
                                                                <span className="meta-icon">👨‍🏫</span>
                                                                <span>{schedule.lecturer?.name || 'TBA'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
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
                                        Showing {((pagination.page - 1) * pagination.per_page) + 1} - {Math.min(pagination.page * pagination.per_page, pagination.total)} of {pagination.total}
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
            </div>
        </div>
    );
}

export default Schedules;
