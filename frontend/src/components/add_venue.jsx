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
    code: '',
    name: '',
    building: '',
    floor: '',
    capacity: '',
    type: 'lecture_hall',
    description: ''
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
                <label htmlFor="code">Venue Code *</label>
                <input 
                  type="text" 
                  id="code" 
                  name="code" 
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., LHA, LB101"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Venue Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
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
                  min="0"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Venue Type *</label>
                <select 
                  id="type" 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="lecture_hall">Lecture Hall</option>
                  <option value="lab">Laboratory</option>
                  <option value="tutorial_room">Tutorial Room</option>
                  <option value="seminar_room">Seminar Room</option>
                  <option value="auditorium">Auditorium</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Additional venue details..."
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