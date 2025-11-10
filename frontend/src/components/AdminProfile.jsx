import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/Styles.css';
import Sidebar from './sidebar';

export default function AdminProfile() {
    const [activeTab, setActiveTab] = useState('Profile Information');
    const [profile, setProfile] = useState({
        fullName: 'Admin User',
        email: 'admin@uniattend.edu',
        phone: '+1 (555) 123-4567',
        department: 'IT',
    });

    const [editField, setEditField] = useState(null);
    const [tempValue, setTempValue] = useState('');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const handleEditClick = (field) => {
        setEditField(field);
        setTempValue(profile[field]);
    };

    const handleSave = (field) => {
        setProfile({ ...profile, [field]: tempValue });
        setEditField(null);
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
                        <span>Admin Profile</span>
                    </div>
                </div>

                <div className="profile-header">
                    <h1>Admin Profile</h1>
                </div>
                
                <div className="profile-tabs">
                    {['Profile Information', 'Security', 'Preferences', 'Activity Log'].map((tab) => (
                        <button 
                            key={tab}
                            className={`profile-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Profile Information' && (
                    <>
                        <div className="card-row">
                            <div className="card">
                                <div className="card-header">
                                    <h2>Personal Information</h2>
                                    <button className="btn btn-primary">
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-header">
                                    <h2>Account Security</h2>
                                    <div className="button-group">
                                        <button className="btn btn-primary">
                                            Change Password
                                        </button>
                                        <button className="btn btn-outline">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2>Profile Details</h2>
                            </div>
                            <div className="card-body">
                                {Object.keys(profile).map((key) => (
                                    <div key={key} className="profile-detail-row">
                                        <div className="profile-field">
                                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                                            {editField === key ? (
                                                <input
                                                    type="text"
                                                    className="edit-input"
                                                    value={tempValue}
                                                    onChange={(e) => setTempValue(e.target.value)}
                                                />
                                            ) : (
                                                <span>{profile[key]}</span>
                                            )}
                                        </div>
                                        {editField === key ? (
                                            <button 
                                                className="btn btn-success"
                                                onClick={() => handleSave(key)}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <button 
                                                className="btn btn-secondary"
                                                onClick={() => handleEditClick(key)}
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'Activity Log' && (
                    <div className="card">
                        <div className="card-header">
                            <h2>Recent Activity</h2>
                        </div>
                        <div className="card-body">
                            <table className="activity-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Resource</th>
                                        <th>Date</th>
                                        <th>IP Address</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td data-label="Action">Login</td>
                                        <td data-label="Resource">Admin Dashboard</td>
                                        <td data-label="Date">Today, 09:45 AM</td>
                                        <td data-label="IP Address">192.168.1.105</td>
                                        <td data-label="Status" className="status-success">Success</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}