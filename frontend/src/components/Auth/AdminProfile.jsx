import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Styles.css';
import Sidebar from '../Common/sidebar';
import { profileAPI, authAPI, auditAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function AdminProfile() {
    const [activeTab, setActiveTab] = useState('Profile Information');
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activityLogs, setActivityLogs] = useState([]);
    const { addNotification } = useApp();

    const [editField, setEditField] = useState(null);
    const [tempValue, setTempValue] = useState('');

    // Password change modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (activeTab === 'Activity Log' && profile) {
            fetchActivityLogs();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await profileAPI.get();
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            addNotification('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchActivityLogs = async () => {
        if (!profile?.user_id) return;
        
        try {
            const response = await auditAPI.getAll({
                user_id: profile.user_id,
                per_page: 20,
                page: 1
            });
            setActivityLogs(response.data.items || []);
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            addNotification('Failed to load activity logs', 'error');
        }
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleEditClick = (field) => {
        setEditField(field);
        setTempValue(profile[field] || '');
    };

    const handleSave = async (field) => {
        setLoading(true);
        try {
            const updateData = {
                [field]: tempValue
            };
            
            const response = await profileAPI.update(updateData);
            setProfile(response.data);
            setEditField(null);
            addNotification('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            addNotification(error.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addNotification('New passwords do not match', 'error');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            addNotification('Password must be at least 6 characters', 'error');
            return;
        }

        setLoading(true);
        try {
            await authAPI.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            
            addNotification('Password changed successfully', 'success');
            setShowPasswordModal(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error changing password:', error);
            addNotification(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return (
            <div className="dashboard-container">
                <Sidebar />
                <div className="content">
                    <div className="card">
                        <p style={{ textAlign: 'center', padding: '2rem' }}>Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar Navigation */}
           <Sidebar/>

            {/* Main Content */}
            <div className="content">
                <div className="breadcrumbs-container">
                    <div className="breadcrumbs">
                        <Link to="/dashboard">Dashboard</Link> &gt;
                        <span>Admin Profile</span>
                    </div>
                </div>

                <div className="profile-header">
                    <h1>Admin Profile</h1>
                </div>
                
                <div className="profile-tabs">
                    {['Profile Information', 'Security', 'Preferences', 'Activity Log'].map((tab) => (
                        <button 
                            key={tab}
                            className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Profile Information' && (
                    <>
                        <div className="card-row">
                            <div className="card">
                                <div className="card-header">
                                    <h2>Personal Information</h2>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-header">
                                    <h2>Account Security</h2>
                                    <div className="button-group">
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => setShowPasswordModal(true)}
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2>Profile Details</h2>
                            </div>
                            <div className="card-body">
                                <div className="profile-detail-row">
                                    <div className="profile-field">
                                        <strong>Username:</strong>
                                        <span>{profile.username}</span>
                                    </div>
                                </div>
                                
                                <div className="profile-detail-row">
                                    <div className="profile-field">
                                        <strong>Email:</strong>
                                        {editField === 'email' ? (
                                            <input
                                                type="email"
                                                className="edit-input"
                                                value={tempValue}
                                                onChange={(e) => setTempValue(e.target.value)}
                                            />
                                        ) : (
                                            <span>{profile.email}</span>
                                        )}
                                    </div>
                                    {editField === 'email' ? (
                                        <button 
                                            className="btn btn-success"
                                            onClick={() => handleSave('email')}
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                    ) : (
                                        <button 
                                            className="btn btn-secondary"
                                            onClick={() => handleEditClick('email')}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="profile-detail-row">
                                    <div className="profile-field">
                                        <strong>User Type:</strong>
                                        <span>{profile.user_type}</span>
                                    </div>
                                </div>

                                <div className="profile-detail-row">
                                    <div className="profile-field">
                                        <strong>Status:</strong>
                                        <span className={`badge ${profile.is_active ? 'badge-success' : 'badge-danger'}`}>
                                            {profile.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>

                                <div className="profile-detail-row">
                                    <div className="profile-field">
                                        <strong>Last Login:</strong>
                                        <span>{profile.last_login ? new Date(profile.last_login).toLocaleString() : 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="profile-detail-row">
                                    <div className="profile-field">
                                        <strong>Account Created:</strong>
                                        <span>{profile.created_at ? new Date(profile.created_at).toLocaleString() : 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'Activity Log' && (
                    <div className="card">
                        <div className="card-header">
                            <h2>Recent Activity</h2>
                        </div>
                        <div className="card-body">
                            {activityLogs.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '2rem' }}>No activity logs found</p>
                            ) : (
                                <table className="activity-table">
                                    <thead>
                                        <tr>
                                            <th>Action</th>
                                            <th>Entity Type</th>
                                            <th>Date</th>
                                            <th>IP Address</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activityLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td data-label="Action">{log.action}</td>
                                                <td data-label="Entity Type">{log.entity_type || 'N/A'}</td>
                                                <td data-label="Date">{new Date(log.created_at).toLocaleString()}</td>
                                                <td data-label="IP Address">{log.ip_address || 'N/A'}</td>
                                                <td data-label="Details">{log.details ? JSON.stringify(log.details) : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Password Change Modal */}
                {showPasswordModal && (
                    <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Change Password</h2>
                                <button className="close-btn" onClick={() => setShowPasswordModal(false)}>×</button>
                            </div>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Current Password *</label>
                                        <input
                                            type="password"
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="form-control"
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password *</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength="6"
                                            className="form-control"
                                            placeholder="Enter new password (min 6 characters)"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password *</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength="6"
                                            className="form-control"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowPasswordModal(false)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

