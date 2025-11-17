import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Common/sidebar';
import { userAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../css/Styles.css';

function UserManagement() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { addNotification } = useApp();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        role: 'student',
        status: 'active'
    });

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const fetchUser = async () => {
        setLoading(true);
        try {
            const response = await userAPI.getById(userId);
            const user = response.data;
            setFormData({
                username: user.username || '',
                email: user.email || '',
                firstName: user.first_name || '',
                lastName: user.last_name || '',
                role: user.user_type || 'student', // Map user_type from backend
                status: user.is_active ? 'active' : 'inactive' // Map is_active to status
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            addNotification(error.response?.data?.message || 'Failed to load user', 'error');
            navigate('/users');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updateData = {
                username: formData.username,
                email: formData.email,
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role,
                status: formData.status
            };

            await userAPI.update(userId, updateData);
            addNotification('User updated successfully', 'success');
            navigate('/users');
        } catch (error) {
            console.error('Error updating user:', error);
            addNotification(error.response?.data?.message || 'Failed to update user', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            await userAPI.delete(userId);
            addNotification('User deleted successfully', 'success');
            navigate('/users');
        } catch (error) {
            console.error('Error deleting user:', error);
            addNotification(error.response?.data?.message || 'Failed to delete user', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/users');
    };

    if (loading && !formData.username) {
        return (
            <div className="dashboard-container">
                <Sidebar />
                <div className="content">
                    <div className="loading">Loading user...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content">
                <div className="page-header">
                    <h1>Edit User</h1>
                    <button 
                        className="btn btn-danger" 
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        Delete User
                    </button>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="username">Username *</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">Role *</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                >
                                    <option value="student">Student</option>
                                    <option value="lecturer">Lecturer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status *</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UserManagement;


