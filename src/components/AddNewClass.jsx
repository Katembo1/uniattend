import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/Styles.css';
import Sidebar from './sidebar';

function AddNewClass() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    className: '',
    courseCode: '',
    lecturer: '',
    venue: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    capacity: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      console.log('Class data submitted:', formData);
      setSuccessMessage('Class added successfully!');
      setFormData({
        className: '',
        courseCode: '',
        lecturer: '',
        venue: '',
        day: 'Monday',
        startTime: '',
        endTime: '',
        capacity: ''
      });
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/scheduling'); // Redirect to scheduling page after success
      }, 2000);
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.className.trim()) errors.className = 'Class name is required';
    if (!data.courseCode.trim()) errors.courseCode = 'Course code is required';
    if (!data.lecturer.trim()) errors.lecturer = 'Lecturer is required';
    if (!data.venue.trim()) errors.venue = 'Venue is required';
    if (!data.startTime) errors.startTime = 'Start time is required';
    if (!data.endTime) errors.endTime = 'End time is required';
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.endTime = 'End time must be after start time';
    }
    if (!data.capacity) errors.capacity = 'Capacity is required';
    else if (isNaN(data.capacity) || data.capacity < 1) errors.capacity = 'Capacity must be a positive number';
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
            <Link to="/scheduling">Scheduling</Link> &gt;
            <span>Add New Class</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Add New Class</h2>
          </div>
          <div className="card-body">
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Class Name</label>
                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    onChange={handleChange}
                    className={formErrors.className ? 'input-error' : ''}
                  />
                  {formErrors.className && <div className="error-message">{formErrors.className}</div>}
                </div>

                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleChange}
                    className={formErrors.courseCode ? 'input-error' : ''}
                  />
                  {formErrors.courseCode && <div className="error-message">{formErrors.courseCode}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lecturer</label>
                  <input
                    type="text"
                    name="lecturer"
                    value={formData.lecturer}
                    onChange={handleChange}
                    className={formErrors.lecturer ? 'input-error' : ''}
                  />
                  {formErrors.lecturer && <div className="error-message">{formErrors.lecturer}</div>}
                </div>

                <div className="form-group">
                  <label>Venue</label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className={formErrors.venue ? 'input-error' : ''}
                  />
                  {formErrors.venue && <div className="error-message">{formErrors.venue}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Day</label>
                  <select 
                    name="day" 
                    value={formData.day} 
                    onChange={handleChange}
                    className="role-select"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={formErrors.startTime ? 'input-error' : ''}
                  />
                  {formErrors.startTime && <div className="error-message">{formErrors.startTime}</div>}
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={formErrors.endTime ? 'input-error' : ''}
                  />
                  {formErrors.endTime && <div className="error-message">{formErrors.endTime}</div>}
                </div>
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className={formErrors.capacity ? 'input-error' : ''}
                />
                {formErrors.capacity && <div className="error-message">{formErrors.capacity}</div>}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate('/scheduling')}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddNewClass;