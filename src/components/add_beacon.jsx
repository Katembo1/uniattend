import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './css/AddBeacon.css';
import Sidebar from './sidebar';

function AddBeacon() {
  return (
  <body>
      <Sidebar/>
      <div className="content">
        <div className="breadcrumbs">
          <Link to="/dashboard">Dashboard</Link> &gt;
          <Link to="/venues">Venues & Beacons</Link> <span>Add Beacon</span> 
        </div>
        <div className="form-container">
          <h1>Add New Beacon</h1>
          <form>
            <div className="form-group">
              <label htmlFor="beaconName">Beacon Name</label>
              <input type="text" id="beaconName" name="beaconName" required />
            </div>
            <div className="form-group">
              <label htmlFor="building">Building</label>
              <input type="text" id="building" name="building" required />
            </div>
            <div className="form-group">
              <label htmlFor="floor">Floor</label>
              <input type="number" id="floor" name="floor" required />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status">
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="form-group">
              <button type="submit">Add Beacon</button>
            </div>
          </form>
        </div>
      </div>
      </body>
  );
}

export default AddBeacon;