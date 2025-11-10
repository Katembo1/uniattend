import React, { useState } from 'react';
import './Users/AddNewUser.css'; // Create a CSS file for styling
import './css/Styles.css'
import { Link,useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';

function AddNewUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'student',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      console.log('Form data submitted:', formData);
      setSuccessMessage('User added successfully!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'student',
        password: '',
        confirmPassword: '',
      });
      setFormErrors({});
      setTimeout(() => setSuccessMessage(''), 3000);
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
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            
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
                <button type="button" className="btn-secondary" onClick={() => navigate('/users')}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add User
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