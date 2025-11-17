import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import { dashboardAPI, auditAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../css/Activities.css';

function Activities() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        per_page: 20
    });
    const [completedActivities, setCompletedActivities] = useState(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const { addNotification } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        fetchActivities();
    }, [pagination.page]);

    const fetchActivities = async () => {
        try {
            setLoading(true);
            const response = await dashboardAPI.getRecentActivity({
                page: pagination.page,
                per_page: pagination.per_page
            });

            setActivities(response.data.items || []);
            setPagination({
                page: response.data.page,
                pages: response.data.pages,
                total: response.data.total,
                per_page: response.data.per_page
            });
        } catch (error) {
            console.error('Error fetching activities:', error);
            addNotification(
                error.response?.data?.message || 'Failed to load activities',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteActivity = async (activityId) => {
        try {
            const response = await dashboardAPI.deleteActivity(activityId);
            addNotification(response.data.message || 'Activity deleted successfully', 'success');
            
            // Remove from list
            setActivities(prev => prev.filter(a => a.id !== activityId));
            
            // Update total count in pagination
            setPagination(prev => ({
                ...prev,
                total: Math.max(0, prev.total - 1)
            }));
            
            // Remove from completed activities if it was marked as completed
            setCompletedActivities(prev => {
                const newSet = new Set(prev);
                newSet.delete(activityId);
                return newSet;
            });
            
            setShowDeleteModal(false);
            setSelectedActivity(null);
        } catch (error) {
            console.error('Error deleting activity:', error);
            addNotification(
                error.response?.data?.message || 'Failed to delete activity',
                'error'
            );
        }
    };

    const handleCheckActivity = (activityId) => {
        setCompletedActivities(prev => {
            const newSet = new Set(prev);
            if (newSet.has(activityId)) {
                newSet.delete(activityId);
            } else {
                newSet.add(activityId);
            }
            return newSet;
        });
    };

    const handleUndoActivity = (activityId) => {
        setCompletedActivities(prev => {
            const newSet = new Set(prev);
            newSet.delete(activityId);
            return newSet;
        });
        addNotification('Activity marked as incomplete', 'info');
    };

    const confirmDelete = (activity) => {
        setSelectedActivity(activity);
        setShowDeleteModal(true);
    };

    const getActivityIcon = (actionType, entityType) => {
        if (actionType === 'create') {
            if (entityType === 'user' || entityType === 'student' || entityType === 'lecturer') return '👤';
            if (entityType === 'venue' || entityType === 'class') return '🏛️';
            if (entityType === 'beacon') return '📡';
            if (entityType === 'timetable') return '📅';
            return '➕';
        }
        if (actionType === 'update') return '✏️';
        if (actionType === 'delete') return '🗑️';
        if (actionType === 'login') return '🔐';
        if (actionType === 'logout') return '🚪';
        if (actionType === 'attendance') return '📊';
        return '📝';
    };

    const getActivityColor = (actionType) => {
        if (actionType === 'create') return 'success';
        if (actionType === 'update') return 'info';
        if (actionType === 'delete') return 'danger';
        if (actionType === 'login' || actionType === 'logout') return 'primary';
        return 'secondary';
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'Unknown time';
        
        const now = new Date();
        const activityDate = new Date(timestamp);
        const diffMs = now - activityDate;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        if (diffSecs < 10) return 'just now';
        if (diffSecs < 60) return `${diffSecs} seconds ago`;
        if (diffMins === 1) return '1 minute ago';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours === 1) return '1 hour ago';
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffWeeks === 1) return '1 week ago';
        if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
        if (diffMonths === 1) return '1 month ago';
        if (diffMonths < 12) return `${diffMonths} months ago`;
        if (diffYears === 1) return '1 year ago';
        return `${diffYears} years ago`;
    };

    // Auto-update relative times every minute
    useEffect(() => {
        const intervalId = setInterval(() => {
            // Force re-render to update relative times
            setActivities(prev => [...prev]);
        }, 60000); // Update every minute

        return () => clearInterval(intervalId);
    }, []);

    const getFilteredActivities = () => {
        let filtered = activities;

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(activity => activity.action_type === filterType);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(activity => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    activity.description?.toLowerCase().includes(searchLower) ||
                    activity.entity_type?.toLowerCase().includes(searchLower) ||
                    activity.username?.toLowerCase().includes(searchLower) ||
                    activity.action_type?.toLowerCase().includes(searchLower)
                );
            });
        }

        return filtered;
    };

    const filteredActivities = getFilteredActivities();

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content activities-page">
                <div className="page-header">
                    <div className="header-content">
                        <button 
                            className="back-button" 
                            onClick={() => navigate('/dashboard')}
                            title="Back to Dashboard"
                        >
                            ← Back
                        </button>
                        <h1>All Activities</h1>
                    </div>
                    <div className="header-stats">
                        <span className="stat-item">
                            <strong>{pagination.total}</strong> Total Activities
                        </span>
                    </div>
                </div>

                <div className="activities-controls">
                    <div className="search-filter-group">
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Types</option>
                            <option value="create">Created</option>
                            <option value="update">Updated</option>
                            <option value="delete">Deleted</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                        </select>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={fetchActivities}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading activities...</p>
                    </div>
                ) : filteredActivities.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h2>No Activities Found</h2>
                        <p>
                            {activities.length === 0 
                                ? "There are no activities recorded yet. Start by creating users, venues, or schedules."
                                : "No activities match your current filters. Try adjusting your search or filter criteria."}
                        </p>
                        {activities.length === 0 && (
                            <div className="empty-actions">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate('/users')}
                                >
                                    Create User
                                </button>
                                <button 
                                    className="btn btn-outline"
                                    onClick={() => navigate('/venues')}
                                >
                                    Add Venue
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="activities-list">
                            {filteredActivities.map((activity) => {
                                const isCompleted = completedActivities.has(activity.id);
                                return (
                                    <div 
                                        key={activity.id} 
                                        className={`activity-card ${getActivityColor(activity.action_type)}`}
                                    >
                                        <div className="activity-icon-wrapper">
                                            <div className={`activity-icon ${getActivityColor(activity.action_type)}`}>
                                                {getActivityIcon(activity.action_type, activity.entity_type)}
                                            </div>
                                        </div>

                                        <div className="activity-content">
                                            <div className="activity-header">
                                                <h3 className="activity-title">
                                                    {activity.description || `${activity.action_type} ${activity.entity_type}`}
                                                </h3>
                                                <span className={`activity-badge ${getActivityColor(activity.action_type)}`}>
                                                    {activity.action_type?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="activity-meta">
                                                <span className="activity-user">
                                                    👤 {activity.username || 'System'}
                                                </span>
                                                <span className="activity-entity">
                                                    📦 {activity.entity_type || 'Unknown'}
                                                </span>
                                                <span 
                                                    className="activity-time"
                                                    title={activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Unknown'}
                                                >
                                                    🕐 {formatTimeAgo(activity.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="activity-actions">
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => confirmDelete(activity)}
                                                title="Delete activity"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedActivity && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Delete Activity</h2>
                            <p>Are you sure you want to delete this activity? This action cannot be undone.</p>
                            <div className="activity-preview">
                                <div className="preview-icon">
                                    {getActivityIcon(selectedActivity.action_type, selectedActivity.entity_type)}
                                </div>
                                <div className="preview-details">
                                    <strong>{selectedActivity.description}</strong>
                                    <p>
                                        <span>{selectedActivity.action_type}</span> • 
                                        <span>{selectedActivity.entity_type}</span> • 
                                        <span>{formatTimeAgo(selectedActivity.created_at)}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedActivity(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteActivity(selectedActivity.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Activities;
