import React, { useState } from 'react';
import './Users/AddNewUser.css'; // Create a CSS file for styling
import './css/Styles.css'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import { userAPI } from '../services/api';
import { useApp } from '../context/AppContext';

function AddNewUser() {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    user_type: 'student',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setSubmitting(true);
      try {
        // Prepare payload matching backend expectations
        const payload = {
          username: formData.username,
          email: formData.email,
          user_type: formData.user_type,
          password: formData.password
        };

        await userAPI.create(payload);
        addNotification('User added successfully!', 'success');
        
        // Reset form
        setFormData({
          username: '',
          firstName: '',
          lastName: '',
          email: '',
          user_type: 'student',
          password: '',
          confirmPassword: '',
        });
        
        // Navigate to users page after short delay
        setTimeout(() => {
          navigate('/users');
        }, 1500);
      } catch (error) {
        console.error('Error creating user:', error);
        const errorMsg = error.response?.data?.message || 'Failed to create user';
        addNotification(errorMsg, 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.username.trim()) {
      errors.username = 'Username is required';
    } else if (data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = 'Invalid email format';
    }
    if (!data.password.trim()) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <Sidebar/>

      {/* Main Content */}
      <div className="content">
        <div className="breadcrumbs-container"> 
          <div className="breadcrumbs">
            <Link to="/dashboard">Dashboard</Link> &gt;
            <Link to="/users">Users</Link> &gt;
            <span>Add New User</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Add New User</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={formErrors.username ? 'input-error' : ''}
                  placeholder="Enter username (min 3 characters)"
                />
                {formErrors.username && <div className="error-message">{formErrors.username}</div>}
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'input-error' : ''}
                  placeholder="user@example.com"
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>

              <div className="form-group">
                <label>User Type *</label>
                <select 
                  name="user_type" 
                  value={formData.user_type} 
                  onChange={handleChange}
                  className="role-select"
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={formErrors.password ? 'input-error' : ''}
                    placeholder="Min 6 characters"
                  />
                  {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={formErrors.confirmPassword ? 'input-error' : ''}
                    placeholder="Re-enter password"
                  />
                  {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate('/users')} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding User...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddNewUser;