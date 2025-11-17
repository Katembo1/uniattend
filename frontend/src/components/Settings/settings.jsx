import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/Styles.css';
import Sidebar from '../Common/sidebar';
import General from './general';
import Notifications from './notification';
import DataManagement from './data-management';
import Appearance from './appearance';

function Settings() {
    const [activeTab, setActiveTab] = useState('General');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const renderTabContent = () => {
        switch(activeTab) {
            case 'General':
                return <General />;
            case 'Notifications':
                return <Notifications />;
            case 'Data Management':
                return <DataManagement />;
            case 'Appearance':
                return <Appearance />;
            default:
                return <General />;
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
                    <span>Settings</span>
                </div>
                
                <div className="page-header">
                    <h1 className="page-title">System Settings</h1>
                    <p className="page-subtitle">Configure system-wide settings and preferences</p>
                </div>
                
                {/* Tabs */}
                <div className="filter-tabs">
                    {['General', 'Notifications', 'Data Management', 'Appearance'].map((tab) => (
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
                <div className="card">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

export default Settings;

