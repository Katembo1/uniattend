import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './css/AddBeacon.css';
import Sidebar from './sidebar';
import { beaconAPI } from '../services/api';
import { useApp } from '../context/AppContext';

function AddBeacon() {
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    beacon_uuid: '',
    beacon_name: '',
    beacon_major: '',
    beacon_minor: '',
    mac_address: '',
    manufacturer: 'Generic',
    model: '',
    beacon_status: 'Active'
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
      // Convert major/minor to integers
      const payload = {
        ...formData,
        beacon_major: parseInt(formData.beacon_major),
        beacon_minor: parseInt(formData.beacon_minor)
      };

      await beaconAPI.register(payload);
      addNotification('Beacon registered successfully!', 'success');
      navigate('/venues');
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
                  placeholder="e.g., Main Hall Beacon"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="mac_address">MAC Address</label>
                <input 
                  type="text" 
                  id="mac_address" 
                  name="mac_address" 
                  value={formData.mac_address}
                  onChange={handleChange}
                  placeholder="e.g., AA:BB:CC:DD:EE:FF"
                />
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="manufacturer">Manufacturer</label>
                <input 
                  type="text" 
                  id="manufacturer" 
                  name="manufacturer" 
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g., Estimote, Kontakt.io"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="model">Model</label>
                <input 
                  type="text" 
                  id="model" 
                  name="model" 
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., Beacon Pro"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="beacon_status">Status *</label>
              <select 
                id="beacon_status" 
                name="beacon_status"
                value={formData.beacon_status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Faulty">Faulty</option>
              </select>
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