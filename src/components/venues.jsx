import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/Styles.css'
import { FaUserCircle } from 'react-icons/fa';
function Venues() {
    const [activeFilter, setActiveFilter] = useState('All Locations');
    const [searchTerm, setSearchTerm] = useState('');

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const venues = [
        { name: 'Lecture Hall A', type: 'Venue', building: 'Main Building', floor: '2', capacity: '120', status: 'Active' },
        { name: 'Computer Lab 101', type: 'Venue', building: 'Technology Center', floor: '1', capacity: '40', status: 'Active' },
        { name: 'Beacon LH-A1', type: 'Beacon', building: 'Main Building', floor: '2', capacity: '-', status: 'Online' },
        { name: 'Seminar Room 203', type: 'Venue', building: 'Arts Building', floor: '2', capacity: '30', status: 'Active' },
        { name: 'Beacon CL-101', type: 'Beacon', building: 'Technology Center', floor: '-', capacity: '-', status: 'Offline' },
        { name: 'Library Study Area', type: 'Venue', building: 'Library', floor: '3', capacity: '60', status: 'Active' },
        { name: 'Beacon SR-203', type: 'Beacon', building: 'Arts Building', floor: '-', capacity: '-', status: 'Online' },
    ];

    const filteredVenues = venues.filter(venue => {
        if (activeFilter === 'All Locations') return true;
        return venue.type === activeFilter;
    }).filter(venue => {
        return venue.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               venue.building.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="dashboard-container">
            {/* Sidebar - Using consistent classes */}
            <div className="sidebar">
                <h2>UniAttend</h2>
                <ul>
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/users">User Management</Link></li>
                    <li className="active">Venues & Beacons</li>
                    <li><Link to="/scheduling">Class Scheduling</Link></li>
                    <li><Link to="/reports">Attendance Reports</Link></li>
                </ul>
                
                <h3>ADMIN</h3>
                <ul>
                    <li><Link to="/settings">Settings</Link></li>
                    <li><Link to="/security">Security</Link></li>
                    <li><Link to="/admin-profile">Admin Profile</Link></li>
                </ul>
                
                <div className="admin-user">
                <FaUserCircle size={30} />
          Admin User<br />
          System Administrator
        </div>
            </div>

            {/* Main Content */}
            <div className="content">
                <div className="breadcrumbs">
                    <Link to="/dashboard">Dashboard</Link> 
                    <span>Venues & Beacons</span>
                </div>
                
                <div className="page-header">
                    <h1 className="page-title">Venues & Beacons</h1>
                    <div className="header-actions">
                        <Link to="/add_venue" className="btn btn-primary">
                            Add New Venue
                        </Link>
                        <Link to="/add_beacon" className="btn btn-success">
                            Add New Beacon
                        </Link>
                    </div>
                </div>
                
                {/* Filters */}
                <div className="filter-tabs">
                    {['All Locations', 'Venue', 'Beacon', 'Maps'].map((filter) => (
                        <button
                            key={filter}
                            className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => handleFilterClick(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
                
                {/* Search Bar */}
                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Search locations..." 
                        value={searchTerm} 
                        onChange={handleSearchChange} 
                    />
                    <button className="search-btn">🔍</button>
                </div>
                
                {/* Table */}
                <div className="card">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Building</th>
                                    <th>Floor</th>
                                    <th>Capacity</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVenues.map((venue, index) => (
                                    <tr key={venue.name}>
                                        <td>{venue.name}</td>
                                        <td>{venue.type}</td>
                                        <td>{venue.building}</td>
                                        <td>{venue.floor}</td>
                                        <td>{venue.capacity}</td>
                                        <td>
                                            <span className={`badge ${
                                                venue.status === 'Active' || venue.status === 'Online' 
                                                    ? 'badge-success' 
                                                    : 'badge-danger'
                                            }`}>
                                                {venue.status}
                                            </span>
                                        </td>
                                        <td className="table-actions">
                                            <button className="action-btn">📝</button>
                                            <button className="action-btn">👁️</button>
                                            <button className="action-btn">🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Venues;