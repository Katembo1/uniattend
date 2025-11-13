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

    // Modal states
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});

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
            id: v.id || v.class_id,
            itemType: 'Venue',
            name: v.name || v.code || 'Unknown',
            type: v.type || 'lecture_hall',
            building: v.building || '-',
            floor: v.floor || '-',
            capacity: v.capacity || '-',
            status: 'Active',
            description: v.description || '',
            code: v.code || ''
        })),
        ...beacons.map(b => ({
            id: b.beacon_id,
            itemType: 'Beacon',
            name: b.beacon_name || b.beacon_uuid?.substring(0, 8) || 'Unknown',
            type: 'beacon',
            building: '-',
            floor: '-',
            capacity: '-',
            status: b.beacon_status || 'Unknown',
            battery_level: b.battery_level,
            uuid: b.beacon_uuid,
            major: b.beacon_major,
            minor: b.beacon_minor
        }))
    ];

    const filteredVenues = combinedData.filter(item => {
        if (activeFilter === 'All Locations') return true;
        if (activeFilter === 'Maps') return false; // Maps view not implemented yet
        return item.itemType === activeFilter;
    }).filter(item => {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
               item.building.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // View handler
    const handleView = (item) => {
        setSelectedItem(item);
        setShowViewModal(true);
    };

    // Edit handlers
    const handleEdit = (item) => {
        setSelectedItem(item);
        
        if (item.itemType === 'Venue') {
            setEditFormData({
                name: item.name,
                code: item.code,
                building: item.building !== '-' ? item.building : '',
                floor: item.floor !== '-' ? item.floor : '',
                capacity: item.capacity !== '-' ? item.capacity : '',
                type: item.type,
                description: item.description
            });
        } else {
            setEditFormData({
                beacon_name: item.name,
                beacon_status: item.status,
                battery_level: item.battery_level || ''
            });
        }
        
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            if (selectedItem.itemType === 'Venue') {
                await classAPI.update(selectedItem.id, editFormData);
                addNotification('Venue updated successfully', 'success');
            } else {
                await beaconAPI.update(selectedItem.id, editFormData);
                addNotification('Beacon updated successfully', 'success');
            }
            
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            console.error('Error updating:', error);
            addNotification(error.response?.data?.message || `Failed to update ${selectedItem.itemType}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Delete handlers
    const handleDelete = (item) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setLoading(true);
        
        try {
            if (selectedItem.itemType === 'Venue') {
                await classAPI.delete(selectedItem.id);
                addNotification('Venue deleted successfully', 'success');
            } else {
                await beaconAPI.delete(selectedItem.id);
                addNotification('Beacon deleted successfully', 'success');
            }
            
            setShowDeleteModal(false);
            fetchData();
        } catch (error) {
            console.error('Error deleting:', error);
            addNotification(error.response?.data?.message || `Failed to delete ${selectedItem.itemType}`, 'error');
        } finally {
            setLoading(false);
        }
    };

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
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                            Loading venues and beacons...
                                        </td>
                                    </tr>
                                ) : filteredVenues.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                            No venues or beacons found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVenues.map((venue, index) => (
                                        <tr key={`${venue.itemType}-${venue.id || index}`}>
                                            <td>{venue.name}</td>
                                            <td>{venue.itemType}</td>
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
                                                <button 
                                                    className="action-btn" 
                                                    title="Edit"
                                                    onClick={() => handleEdit(venue)}
                                                    disabled={loading}
                                                >
                                                    📝
                                                </button>
                                                <button 
                                                    className="action-btn" 
                                                    title="View Details"
                                                    onClick={() => handleView(venue)}
                                                >
                                                    👁️
                                                </button>
                                                <button 
                                                    className="action-btn" 
                                                    title="Delete"
                                                    onClick={() => handleDelete(venue)}
                                                    disabled={loading}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* View Modal */}
                {showViewModal && selectedItem && (
                    <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>{selectedItem.itemType} Details</h2>
                                <button className="close-btn" onClick={() => setShowViewModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                {selectedItem.itemType === 'Venue' ? (
                                    <>
                                        <div className="detail-row">
                                            <strong>Name:</strong> {selectedItem.name}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Code:</strong> {selectedItem.code}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Type:</strong> {selectedItem.type}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Building:</strong> {selectedItem.building}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Floor:</strong> {selectedItem.floor}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Capacity:</strong> {selectedItem.capacity}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Description:</strong> {selectedItem.description || 'N/A'}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Status:</strong> {selectedItem.status}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="detail-row">
                                            <strong>Name:</strong> {selectedItem.name}
                                        </div>
                                        <div className="detail-row">
                                            <strong>UUID:</strong> {selectedItem.uuid}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Major:</strong> {selectedItem.major}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Minor:</strong> {selectedItem.minor}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Battery Level:</strong> {selectedItem.battery_level ? `${selectedItem.battery_level}%` : 'N/A'}
                                        </div>
                                        <div className="detail-row">
                                            <strong>Status:</strong> {selectedItem.status}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && selectedItem && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit {selectedItem.itemType}</h2>
                                <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body">
                                    {selectedItem.itemType === 'Venue' ? (
                                        <>
                                            <div className="form-group">
                                                <label>Name *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editFormData.name || ''}
                                                    onChange={handleEditChange}
                                                    required
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Code *</label>
                                                <input
                                                    type="text"
                                                    name="code"
                                                    value={editFormData.code || ''}
                                                    onChange={handleEditChange}
                                                    required
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Building</label>
                                                <input
                                                    type="text"
                                                    name="building"
                                                    value={editFormData.building || ''}
                                                    onChange={handleEditChange}
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Floor</label>
                                                <input
                                                    type="text"
                                                    name="floor"
                                                    value={editFormData.floor || ''}
                                                    onChange={handleEditChange}
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Capacity</label>
                                                <input
                                                    type="number"
                                                    name="capacity"
                                                    value={editFormData.capacity || ''}
                                                    onChange={handleEditChange}
                                                    min="0"
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Type</label>
                                                <select
                                                    name="type"
                                                    value={editFormData.type || 'lecture_hall'}
                                                    onChange={handleEditChange}
                                                    className="form-control"
                                                >
                                                    <option value="lecture_hall">Lecture Hall</option>
                                                    <option value="lab">Lab</option>
                                                    <option value="tutorial_room">Tutorial Room</option>
                                                    <option value="auditorium">Auditorium</option>
                                                    <option value="seminar_room">Seminar Room</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea
                                                    name="description"
                                                    value={editFormData.description || ''}
                                                    onChange={handleEditChange}
                                                    rows="3"
                                                    className="form-control"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="form-group">
                                                <label>Beacon Name</label>
                                                <input
                                                    type="text"
                                                    name="beacon_name"
                                                    value={editFormData.beacon_name || ''}
                                                    onChange={handleEditChange}
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Status</label>
                                                <select
                                                    name="beacon_status"
                                                    value={editFormData.beacon_status || 'Active'}
                                                    onChange={handleEditChange}
                                                    className="form-control"
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                    <option value="Maintenance">Maintenance</option>
                                                    <option value="Low Battery">Low Battery</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Battery Level (%)</label>
                                                <input
                                                    type="number"
                                                    name="battery_level"
                                                    value={editFormData.battery_level || ''}
                                                    onChange={handleEditChange}
                                                    min="0"
                                                    max="100"
                                                    className="form-control"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowEditModal(false)}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && selectedItem && (
                    <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Confirm Delete</h2>
                                <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to delete this {selectedItem.itemType.toLowerCase()}?</p>
                                <div className="detail-row">
                                    <strong>{selectedItem.itemType}:</strong> {selectedItem.name}
                                </div>
                                {selectedItem.itemType === 'Venue' && (
                                    <div className="detail-row">
                                        <strong>Code:</strong> {selectedItem.code}
                                    </div>
                                )}
                                <p style={{ marginTop: '15px', color: '#dc3545' }}>
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-danger" 
                                    onClick={confirmDelete}
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Venues;