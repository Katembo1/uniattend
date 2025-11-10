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
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
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
        await userAPI.create({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          password: formData.password
        });

        addNotification('User added successfully!', 'success');
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          role: 'student',
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
    if (!data.firstName.trim()) errors.firstName = 'First name is required';
    if (!data.lastName.trim()) errors.lastName = 'Last name is required';
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
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={formErrors.firstName ? 'input-error' : ''}
                  />
                  {formErrors.firstName && <div className="error-message">{formErrors.firstName}</div>}
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={formErrors.lastName ? 'input-error' : ''}
                  />
                  {formErrors.lastName && <div className="error-message">{formErrors.lastName}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={formErrors.email ? 'input-error' : ''}
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>

              <div className="form-group">
                <label>Role</label>
                <select 
                  name="role" 
                  value={formData.role} 
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
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={formErrors.password ? 'input-error' : ''}
                  />
                  {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={formErrors.confirmPassword ? 'input-error' : ''}
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