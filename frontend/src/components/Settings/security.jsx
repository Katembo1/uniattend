import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Styles.css';
import Sidebar from '../Common/sidebar';

function Security() {
    const [activeTab, setActiveTab] = useState('Authentication');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="app-container">
          <Sidebar/>
            <div className="content">
                <div className="breadcrumbs">
                    <Link to="/dashboard">Dashboard</Link> <span>&gt;</span> <Link to="/settings">Settings</Link> <span>&gt;</span> Security
                </div>
                
                <div className="page-header">
                    <h1 className="page-title">Security Settings</h1>
                </div>
                
                <div className="card">
    <div className="security-tabs">
        <button
            className={`security-tab ${activeTab === 'Authentication' ? 'active' : ''}`}
            onClick={() => handleTabClick('Authentication')}
        >
            <span className="tab-label">Authentication</span>
            {activeTab === 'Authentication' && <span className="tab-indicator"></span>}
        </button>
        <button
            className={`security-tab ${activeTab === 'Access Control' ? 'active' : ''}`}
            onClick={() => handleTabClick('Access Control')}
        >
            <span className="tab-label">Access Control</span>
            {activeTab === 'Access Control' && <span className="tab-indicator"></span>}
        </button>
        <button
            className={`security-tab ${activeTab === 'Data Protection' ? 'active' : ''}`}
            onClick={() => handleTabClick('Data Protection')}
        >
            <span className="tab-label">Data Protection</span>
            {activeTab === 'Data Protection' && <span className="tab-indicator"></span>}
        </button>
        <button
            className={`security-tab ${activeTab === 'Audit Logs' ? 'active' : ''}`}
            onClick={() => handleTabClick('Audit Logs')}
        >
            <span className="tab-label">Audit Logs</span>
            {activeTab === 'Audit Logs' && <span className="tab-indicator"></span>}
        </button>
        <button
            className={`security-tab ${activeTab === 'Compliance' ? 'active' : ''}`}
            onClick={() => handleTabClick('Compliance')}
        >
            <span className="tab-label">Compliance</span>
            {activeTab === 'Compliance' && <span className="tab-indicator"></span>}
        </button>
    </div>

    
                    <div className="card-header">
                        <h2 className="card-title">Authentication Settings</h2>
                    </div>
                    
                    <div className="setting-item">
                        <div className="setting-details">
                            <h3>Password Policy</h3>
                            <p>Configure password requirements and expiration settings</p>
                        </div>
                        <div className="actions">
                            <button className="btn btn-outline">Edit</button>
                        </div>
                    </div>
                    
                    <div className="setting-item">
                        <div className="setting-details">
                            <h3>Minimum Password Length</h3>
                            <p>12 characters</p>
                        </div>
                        <div className="actions">
                            <button className="action-btn">📝</button>
                        </div>
                    </div>
                    
                    <div className="setting-item">
                        <div className="setting-details">
                            <h3>Password Complexity</h3>
                            <p>Requires uppercase, lowercase, number, symbol</p>
                        </div>
                        <div className="actions">
                            <button className="action-btn">📝</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Security;

