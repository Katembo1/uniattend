import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Styles.css';
import Sidebar from '../Common/sidebar';
import { userAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

function Users() {
    const [activeFilter, setActiveFilter] = useState('All Users');
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, per_page: 20, total: 0 });
    const [retryCount, setRetryCount] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { addNotification } = useApp();
    const location = useLocation();
    const MAX_RETRIES = 3;

    const fetchUsers = useCallback(async (isRetry = false) => {
        // Prevent redundant fetches
        if (loading) return;
        
        // Check retry limit
        if (isRetry && retryCount >= MAX_RETRIES) {
            addNotification(`Maximum retry attempts reached (${MAX_RETRIES})`, 'error');
            setLoading(false);
            return;
        }
        
        setLoading(true);
        const timeoutId = setTimeout(() => {
            console.error('User fetch timeout');
            setLoading(false);
            if (retryCount < MAX_RETRIES) {
                const nextRetry = retryCount + 1;
                addNotification(`Request timeout - Retry ${nextRetry}/${MAX_RETRIES}`, 'warning');
                setRetryCount(nextRetry);
            }
        }, 8000); // 8 second timeout
        
        try {
            // Determine user_type filter for backend
            let user_type = null;
            if (activeFilter === 'Students') user_type = 'student';
            else if (activeFilter === 'Lecturers') user_type = 'lecturer';
            else if (activeFilter === 'Admins') user_type = 'admin';

            const response = await userAPI.getAll({
                page: pagination.page,
                per_page: pagination.per_page,
                user_type: user_type
            });

            clearTimeout(timeoutId);
            
            // Map backend fields to frontend display
            const mappedUsers = (response.data.items || []).map(user => ({
                ...user,
                id: user.user_id || user.id,
                role: user.user_type || 'student', // Map user_type to role
                status: user.is_active ? 'active' : 'inactive', // Map is_active to status
                first_name: user.first_name || '',
                last_name: user.last_name || ''
            }));
            
            setUsers(mappedUsers);
            setPagination(prev => ({
                ...prev,
                total: response.data.total,
                pages: response.data.pages
            }));
            setRetryCount(0); // Reset retry count on success
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Error fetching users:', error);
            
            // Log detailed error information
            console.error('Error details:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                url: error.config?.url
            });
            
            const currentRetry = retryCount + 1;
            
            if (currentRetry < MAX_RETRIES) {
                addNotification(`Failed to load users - Retry ${currentRetry}/${MAX_RETRIES}`, 'warning');
                setRetryCount(currentRetry);
                // Auto-retry after 2 seconds
                setTimeout(() => fetchUsers(true), 2000);
            } else {
                const errorMsg = error.response?.data?.message || 'Failed to load users after 3 attempts';
                addNotification(errorMsg, 'error');
            }
        } finally {
            setLoading(false);
        }
    }, [activeFilter, pagination.page, pagination.per_page, addNotification, loading, retryCount]);

    useEffect(() => {
        // Reset retry count when filter or page changes
        setRetryCount(0);
        // Only fetch once on mount or when filter/page changes
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter, pagination.page]); // Intentionally limited dependencies
    
    // Refetch when location changes (e.g., returning from add-user page)
    useEffect(() => {
        // Check if we're coming back to this page
        if (location.pathname === '/users') {
            fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;

        setLoading(true);
        try {
            await userAPI.delete(selectedUser.id);
            addNotification('User deleted successfully', 'success');
            setShowDeleteModal(false);
            setSelectedUser(null);
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error deleting user:', error);
            addNotification(error.response?.data?.message || 'Failed to delete user', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleActivate = async (userId) => {
        try {
            await userAPI.activate(userId);
            addNotification('User activated successfully', 'success');
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error activating user:', error);
            addNotification('Failed to activate user', 'error');
        }
    };

    const handleDeactivate = async (userId) => {
        try {
            await userAPI.deactivate(userId);
            addNotification('User deactivated successfully', 'success');
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Error deactivating user:', error);
            addNotification('Failed to deactivate user', 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.name?.toLowerCase().includes(searchLower) ||
            user.first_name?.toLowerCase().includes(searchLower) ||
            user.last_name?.toLowerCase().includes(searchLower) ||
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="dashboard-container">
            {/* Sidebar Navigation - Only this navigation will be visible */}
            <Sidebar/>

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
                                onClick={() => handleFilterClick(filter)}
                            >
                                {filter}
                            </button>
                        ))}
                        <button
                            className="filter-button refresh-button"
                            onClick={() => fetchUsers()}
                            disabled={loading}
                            title="Refresh user list"
                        >
                            🔄 Refresh
                        </button>
                    </div>

                    <div className="search-bar">
                        <input 
                            type="text" 
                            placeholder="Search by name, username, or email..." 
                            value={searchTerm} 
                            onChange={handleSearchChange} 
                        />
                    </div>

                    {loading ? (
                        <div className="loading">Loading users...</div>
                    ) : (
                        <div className="card">
                            <div className="table-responsive">
                                <table className="table users-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center' }}>
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(user => (
                                                <tr key={user.id}>
                                                    <td>{user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'N/A'}</td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <span className={`role-badge ${user.role}`}>
                                                            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${user.status}`}>
                                                            {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="table-actions">
                                                            <Link to={`/edit-user/${user.id}`} className="action-btn" title="Edit">
                                                                <span role="img" aria-label="Edit">✏️</span>
                                                            </Link>
                                                            {user.status === 'active' ? (
                                                                <button 
                                                                    className="action-btn" 
                                                                    title="Deactivate"
                                                                    onClick={() => handleDeactivate(user.id)}
                                                                >
                                                                    <span role="img" aria-label="Deactivate">🚫</span>
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    className="action-btn" 
                                                                    title="Activate"
                                                                    onClick={() => handleActivate(user.id)}
                                                                >
                                                                    <span role="img" aria-label="Activate">✅</span>
                                                                </button>
                                                            )}
                                                            <button 
                                                                className="action-btn" 
                                                                title="Delete"
                                                                onClick={() => handleDelete(user)}
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
                            
                            {/* Pagination */}
                            {pagination.pages > 1 && (
                                <div className="pagination">
                                    <button 
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                    >
                                        Previous
                                    </button>
                                    <span>Page {pagination.page} of {pagination.pages}</span>
                                    <button 
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.pages}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Confirm Delete</h2>
                            <p>Are you sure you want to delete this user?</p>
                            {selectedUser && (
                                <div className="user-info">
                                    <p><strong>Name:</strong> {selectedUser.name || `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || selectedUser.username || 'N/A'}</p>
                                    <p><strong>Email:</strong> {selectedUser.email}</p>
                                    <p><strong>Role:</strong> {selectedUser.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) : 'N/A'}</p>
                                    <p><strong>Status:</strong> {selectedUser.status ? selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1) : 'N/A'}</p>
                                </div>
                            )}
                            <p className="warning-text">This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button 
                                    className="btn btn-danger" 
                                    onClick={confirmDelete}
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Delete User'}
                                </button>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedUser(null);
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Users;


