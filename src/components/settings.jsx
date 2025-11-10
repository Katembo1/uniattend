import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/Styles.css';
import Sidebar from './sidebar';

function Settings() {
    const [activeTab, setActiveTab] = useState('General');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar - Using consistent classes */}
            <Sidebar/>

            {/* Main Content */}
            <div className="content">
                <div className="breadcrumbs">
                    <Link to="/dashboard">Dashboard</Link> 
                    <span>Settings</span>
                </div>
                
                <div className="page-header">
                    <h1 className="page-title">System Settings</h1>
                </div>
                
                {/* Tabs */}
                <div className="filter-tabs">
                    {['General', 'Notifications', 'Integrations', 'Data Management', 'Appearance'].map((tab) => (
                        <button
                            key={tab}
                            className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                {/* Tab Content */}
                {activeTab === 'General' && (
                    <div className="card">
                        <h2 className="card-title">General Settings</h2>
                        
                        <div className="setting-item">
                            <div className="setting-details">
                                <h3>Institution Details</h3>
                                <p>Configure your university information and branding</p>
                            </div>
                            <button className="btn btn-primary">
                                Edit
                            </button>
                        </div>
                        
                        <div className="setting-item">
                            <div className="setting-details">
                                <span className="setting-label">Institution Name</span>
                                <strong>University of Technology</strong>
                            </div>
                            <button className="action-btn">📝</button>
                        </div>
                        
                        <div className="setting-item">
                            <div className="setting-details">
                                <span className="setting-label">Academic Year</span>
                                <strong>2023-2024</strong>
                            </div>
                            <button className="action-btn">📝</button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'Notifications' && (
                    <div className="card">
                        <h2 className="card-title">Notification Settings</h2>
                        <p>Notification preferences will appear here</p>
                    </div>
                )}
                
                {/* Add similar sections for other tabs */}
            </div>
        </div>
    );
}

export default Settings;