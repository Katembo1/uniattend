import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';
import { classAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import './css/AddVenue.css';

function AddVenue() {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    class_code: '',
    class_name: '',
    building: '',
    floor: '',
    capacity: '',
    class_type: 'Lecture Hall',
    has_projector: false,
    has_computers: false,
    location_description: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await classAPI.create(formData);
      addNotification('Venue added successfully!', 'success');
      navigate('/venues');
    } catch (error) {
      console.error('Error adding venue:', error);
      const errorMsg = error.response?.data?.message || 'Failed to add venue';
      addNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="content">
        <div className="breadcrumbs">
          <Link to="/dashboard">Dashboard</Link> &gt;
          <Link to="/venues">Venues & Beacons</Link> 
          <span>Add Venue</span>
        </div>
        
        <div className="page-header">
          <h1 className="page-title">Add New Venue</h1>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="class_code">Venue Code *</label>
                <input 
                  type="text" 
                  id="class_code" 
                  name="class_code" 
                  value={formData.class_code}
                  onChange={handleChange}
                  placeholder="e.g., LHA, LB101"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="class_name">Venue Name *</label>
                <input 
                  type="text" 
                  id="class_name" 
                  name="class_name" 
                  value={formData.class_name}
                  onChange={handleChange}
                  placeholder="e.g., Lecture Hall A"
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="building">Building *</label>
                <input 
                  type="text" 
                  id="building" 
                  name="building" 
                  value={formData.building}
                  onChange={handleChange}
                  placeholder="e.g., Main Building"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="floor">Floor</label>
                <input 
                  type="text" 
                  id="floor" 
                  name="floor" 
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="e.g., Ground, 1st, 2nd"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="capacity">Capacity *</label>
                <input 
                  type="number" 
                  id="capacity" 
                  name="capacity" 
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="class_type">Venue Type *</label>
                <select 
                  id="class_type" 
                  name="class_type"
                  value={formData.class_type}
                  onChange={handleChange}
                  required
                >
                  <option value="Lecture Hall">Lecture Hall</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Tutorial Room">Tutorial Room</option>
                  <option value="Seminar Room">Seminar Room</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    name="has_projector"
                    checked={formData.has_projector}
                    onChange={handleChange}
                  />
                  <span>Has Projector</span>
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    name="has_computers"
                    checked={formData.has_computers}
                    onChange={handleChange}
                  />
                  <span>Has Computers</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location_description">Location Description</label>
              <textarea 
                id="location_description" 
                name="location_description"
                value={formData.location_description}
                onChange={handleChange}
                placeholder="Additional location details..."
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/venues')}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Venue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddVenue;