import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Styles.css';
import Sidebar from '../Common/sidebar';
import { timetableAPI, institutionAPI, lecturerAPI, classAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

function AddNewClass() {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitId: '',
    lecturerId: '',
    classId: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    sessionType: 'Lecture'
  });

  // Dropdown options
  const [units, setUnits] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [venues, setVenues] = useState([]);

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [unitsRes, lecturersRes, venuesRes] = await Promise.all([
        institutionAPI.units.getAll(),
        lecturerAPI.getAll(),
        classAPI.getAll()
      ]);
      
      setUnits(unitsRes.data.items || unitsRes.data || []);
      setLecturers(lecturersRes.data.items || lecturersRes.data || []);
      setVenues(venuesRes.data.items || venuesRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      addNotification('Failed to load form options', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      setLoading(true);
      try {
        const payload = {
          unit_id: parseInt(formData.unitId),
          lecturer_id: parseInt(formData.lecturerId),
          class_id: parseInt(formData.classId),
          day_of_week: formData.day,
          start_time: formData.startTime,
          end_time: formData.endTime,
          session_type: formData.sessionType
        };
        
        await timetableAPI.create(payload);
        addNotification('Class schedule added successfully!', 'success');
        
        // Reset form
        setFormData({
          unitId: '',
          lecturerId: '',
          classId: '',
          day: 'Monday',
          startTime: '',
          endTime: '',
          sessionType: 'Lecture'
        });
        
        setTimeout(() => {
          navigate('/scheduling');
        }, 1500);
      } catch (error) {
        console.error('Error adding class schedule:', error);
        addNotification(error.response?.data?.message || 'Failed to add class schedule', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.unitId) errors.unitId = 'Course/Unit is required';
    if (!data.lecturerId) errors.lecturerId = 'Lecturer is required';
    if (!data.classId) errors.classId = 'Venue is required';
    if (!data.startTime) errors.startTime = 'Start time is required';
    if (!data.endTime) errors.endTime = 'End time is required';
    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.endTime = 'End time must be after start time';
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
            <Link to="/scheduling">Scheduling</Link> &gt;
            <span>Add New Class</span>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Add New Class Schedule</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Course/Unit *</label>
                  <select
                    name="unitId"
                    value={formData.unitId}
                    onChange={handleChange}
                    className={formErrors.unitId ? 'input-error role-select' : 'role-select'}
                  >
                    <option value="">Select Course</option>
                    {units.map(unit => (
                      <option key={unit.unit_id} value={unit.unit_id}>
                        {unit.unit_code} - {unit.unit_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.unitId && <div className="error-message">{formErrors.unitId}</div>}
                </div>

                <div className="form-group">
                  <label>Lecturer *</label>
                  <select
                    name="lecturerId"
                    value={formData.lecturerId}
                    onChange={handleChange}
                    className={formErrors.lecturerId ? 'input-error role-select' : 'role-select'}
                  >
                    <option value="">Select Lecturer</option>
                    {lecturers.map(lecturer => (
                      <option key={lecturer.lecturer_id} value={lecturer.lecturer_id}>
                        {lecturer.title} {lecturer.first_name} {lecturer.last_name}
                      </option>
                    ))}
                  </select>
                  {formErrors.lecturerId && <div className="error-message">{formErrors.lecturerId}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Venue *</label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className={formErrors.classId ? 'input-error role-select' : 'role-select'}
                  >
                    <option value="">Select Venue</option>
                    {venues.map(venue => (
                      <option key={venue.class_id} value={venue.class_id}>
                        {venue.class_name} - {venue.building} ({venue.capacity} capacity)
                      </option>
                    ))}
                  </select>
                  {formErrors.classId && <div className="error-message">{formErrors.classId}</div>}
                </div>

                <div className="form-group">
                  <label>Session Type</label>
                  <select 
                    name="sessionType" 
                    value={formData.sessionType} 
                    onChange={handleChange}
                    className="role-select"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Lab">Lab</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Day *</label>
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
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={formErrors.startTime ? 'input-error' : ''}
                  />
                  {formErrors.startTime && <div className="error-message">{formErrors.startTime}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={formErrors.endTime ? 'input-error' : ''}
                  />
                  {formErrors.endTime && <div className="error-message">{formErrors.endTime}</div>}
                </div>

                <div className="form-group">
                  {/* Empty for layout symmetry */}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => navigate('/scheduling')} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Adding Schedule...' : 'Add Schedule'}
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

