import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/Styles.css'
import Sidebar from './sidebar';
import { classAPI, beaconAPI } from '../services/api';
import { useApp } from '../context/AppContext';

function Venues() {
    const [activeFilter, setActiveFilter] = useState('All Locations');
    const [searchTerm, setSearchTerm] = useState('');
    const [venues, setVenues] = useState([]);
    const [beacons, setBeacons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const { addNotification } = useApp();
    const MAX_RETRIES = 3;

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Load once on mount

    const fetchData = async (isRetry = false) => {
        if (loading) return;
        
        if (isRetry && retryCount >= MAX_RETRIES) {
            addNotification('Maximum retry attempts reached', 'error');
            return;
        }
        
        setLoading(true);
        const timeoutId = setTimeout(() => {
            console.error('Venues/Beacons fetch timeout');
            setLoading(false);
            if (retryCount < MAX_RETRIES) {
                addNotification('Request timeout - retrying...', 'warning');
                setRetryCount(prev => prev + 1);
            }
        }, 8000);

        try {
            const [venuesResponse, beaconsResponse] = await Promise.all([
                classAPI.getAll(),
                beaconAPI.getAll()
            ]);

            clearTimeout(timeoutId);
            setVenues(venuesResponse.data.items || venuesResponse.data || []);
            setBeacons(beaconsResponse.data.items || beaconsResponse.data || []);
            setRetryCount(0);
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('Error fetching venues/beacons:', error);
            
            if (retryCount < MAX_RETRIES) {
                addNotification(`Failed to load data - Retry ${retryCount + 1}/${MAX_RETRIES}`, 'warning');
                setRetryCount(prev => prev + 1);
                setTimeout(() => fetchData(true), 2000);
            } else {
                addNotification('Failed to load venues and beacons', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFilterClick = (filter) => {
        setActiveFilter(filter);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Combine venues and beacons for display
    const combinedData = [
        ...venues.map(v => ({
            name: v.name || v.code,
            type: 'Venue',
            building: v.building || '-',
            floor: v.floor || '-',
            capacity: v.capacity || '-',
            status: 'Active'
        })),
        ...beacons.map(b => ({
            name: b.name || b.uuid,
            type: 'Beacon',
            building: '-',
            floor: '-',
            capacity: '-',
            status: b.status || 'Unknown'
        }))
    ];

    const filteredVenues = combinedData.filter(item => {
        if (activeFilter === 'All Locations') return true;
        return item.type === activeFilter;
    }).filter(item => {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               item.building.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="dashboard-container">
            {/* Sidebar - Using consistent classes */}
          <Sidebar/>

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