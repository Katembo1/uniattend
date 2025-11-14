import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/AddBeacon.css';
import Sidebar from '../Common/sidebar';
import { beaconAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

function AddBeacon() {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    beacon_uuid: '',
    beacon_name: '',
    beacon_major: '',
    beacon_minor: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload with correct data types
      const payload = {
        beacon_uuid: formData.beacon_uuid.trim(),
        beacon_major: parseInt(formData.beacon_major),
        beacon_minor: parseInt(formData.beacon_minor),
        beacon_name: formData.beacon_name.trim() || `Beacon ${formData.beacon_major}-${formData.beacon_minor}`
      };

      const response = await beaconAPI.create(payload);
      console.log('Beacon registered:', response.data);
      addNotification('Beacon registered successfully!', 'success');
      
      // Navigate to venues page after short delay
      setTimeout(() => {
        navigate('/venues');
      }, 500);
    } catch (error) {
      console.error('Error registering beacon:', error);
      const errorMsg = error.response?.data?.message || 'Failed to register beacon';
      addNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar/>
      <div className="content">
        <div className="breadcrumbs">
          <Link to="/dashboard">Dashboard</Link> &gt;
          <Link to="/venues">Venues & Beacons</Link> 
          <span>Add Beacon</span>
        </div>
        
        <div className="page-header">
          <h1 className="page-title">Register New Beacon</h1>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="beacon_uuid">Beacon UUID *</label>
                <input 
                  type="text" 
                  id="beacon_uuid" 
                  name="beacon_uuid" 
                  value={formData.beacon_uuid}
                  onChange={handleChange}
                  placeholder="e.g., f7826da6-4fa2-4e98-8024-bc5b71e0893e"
                  required 
                />
                <small>The unique identifier for the BLE beacon</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="beacon_name">Beacon Name</label>
                <input 
                  type="text" 
                  id="beacon_name" 
                  name="beacon_name" 
                  value={formData.beacon_name}
                  onChange={handleChange}
                  placeholder="e.g., Main Hall Beacon (optional)"
                />
                <small>Optional - will auto-generate if left blank</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="beacon_major">Major Value *</label>
                <input 
                  type="number" 
                  id="beacon_major" 
                  name="beacon_major" 
                  value={formData.beacon_major}
                  onChange={handleChange}
                  placeholder="e.g., 1"
                  min="0"
                  max="65535"
                  required 
                />
                <small>Integer between 0-65535</small>
              </div>
              
              <div className="form-group">
                <label htmlFor="beacon_minor">Minor Value *</label>
                <input 
                  type="number" 
                  id="beacon_minor" 
                  name="beacon_minor" 
                  value={formData.beacon_minor}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  min="0"
                  max="65535"
                  required 
                />
                <small>Integer between 0-65535</small>
              </div>
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
                {loading ? 'Registering...' : 'Register Beacon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddBeacon;

