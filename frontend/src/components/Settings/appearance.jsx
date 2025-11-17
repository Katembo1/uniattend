import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../css/Styles.css';

function Appearance() {
    const [loading, setLoading] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        theme_mode: 'light',
        primary_color: '#007bff',
        secondary_color: '#6c757d',
        accent_color: '#28a745',
        logo_url: '',
        favicon_url: '',
        font_family: 'Arial',
        sidebar_position: 'left',
        dashboard_layout: 'grid',
        show_breadcrumbs: true,
        enable_animations: true,
        language: 'en'
    });
    const [originalFormData, setOriginalFormData] = useState(formData);
    const { addNotification } = useApp();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await settingsAPI.getAll();
            const settingsData = response.data;

            const newFormData = {
                theme_mode: settingsData.theme_mode || 'light',
                primary_color: settingsData.primary_color || '#007bff',
                secondary_color: settingsData.secondary_color || '#6c757d',
                accent_color: settingsData.accent_color || '#28a745',
                logo_url: settingsData.logo_url || '',
                favicon_url: settingsData.favicon_url || '',
                font_family: settingsData.font_family || 'Arial',
                sidebar_position: settingsData.sidebar_position || 'left',
                dashboard_layout: settingsData.dashboard_layout || 'grid',
                show_breadcrumbs: settingsData.show_breadcrumbs !== 'false',
                enable_animations: settingsData.enable_animations !== 'false',
                language: settingsData.language || 'en'
            };

            setFormData(newFormData);
            setOriginalFormData(newFormData);
            applyTheme(newFormData);
            addNotification('Appearance settings loaded', 'success');
        } catch (error) {
            console.error('Error fetching settings:', error);
            addNotification('Failed to load appearance settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = (data) => {
        // Apply theme colors to document
        const root = document.documentElement;
        root.style.setProperty('--primary-color', data.primary_color);
        root.style.setProperty('--secondary-color', data.secondary_color);
        root.style.setProperty('--accent-color', data.accent_color);
        
        if (data.theme_mode === 'dark') {
            root.classList.add('dark-theme');
        } else {
            root.classList.remove('dark-theme');
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async (field) => {
        try {
            setLoading(true);
            const updateData = {
                [field]: String(formData[field])
            };

            await settingsAPI.bulkUpdate(updateData);
            setOriginalFormData(prev => ({
                ...prev,
                [field]: formData[field]
            }));
            setEditingField(null);
            applyTheme(formData);
            addNotification(`${field} updated successfully`, 'success');
        } catch (error) {
            console.error('Error updating setting:', error);
            addNotification('Failed to update setting', 'error');
            setFormData(prev => ({
                ...prev,
                [field]: originalFormData[field]
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: originalFormData[field]
        }));
        setEditingField(null);
    };

    return (
        <div className="settings-container">
            <h2 className="card-title">Appearance Settings</h2>

            {/* Theme Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Theme & Colors</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Theme Mode</label>
                        {editingField === 'theme_mode' ? (
                            <div className="input-group">
                                <select
                                    value={formData.theme_mode}
                                    onChange={(e) => handleInputChange('theme_mode', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                    <option value="auto">Auto (System)</option>
                                </select>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('theme_mode')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('theme_mode')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.theme_mode}</strong>
                                <button 
                                    onClick={() => setEditingField('theme_mode')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Primary Color</label>
                        {editingField === 'primary_color' ? (
                            <div className="input-group">
                                <input
                                    type="color"
                                    value={formData.primary_color}
                                    onChange={(e) => handleInputChange('primary_color', e.target.value)}
                                    className="form-input color-input"
                                />
                                <span className="color-value">{formData.primary_color}</span>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('primary_color')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('primary_color')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <div 
                                    className="color-preview"
                                    style={{ backgroundColor: formData.primary_color }}
                                />
                                <strong>{formData.primary_color}</strong>
                                <button 
                                    onClick={() => setEditingField('primary_color')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Secondary Color</label>
                        {editingField === 'secondary_color' ? (
                            <div className="input-group">
                                <input
                                    type="color"
                                    value={formData.secondary_color}
                                    onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                                    className="form-input color-input"
                                />
                                <span className="color-value">{formData.secondary_color}</span>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('secondary_color')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('secondary_color')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <div 
                                    className="color-preview"
                                    style={{ backgroundColor: formData.secondary_color }}
                                />
                                <strong>{formData.secondary_color}</strong>
                                <button 
                                    onClick={() => setEditingField('secondary_color')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Accent Color</label>
                        {editingField === 'accent_color' ? (
                            <div className="input-group">
                                <input
                                    type="color"
                                    value={formData.accent_color}
                                    onChange={(e) => handleInputChange('accent_color', e.target.value)}
                                    className="form-input color-input"
                                />
                                <span className="color-value">{formData.accent_color}</span>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('accent_color')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('accent_color')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <div 
                                    className="color-preview"
                                    style={{ backgroundColor: formData.accent_color }}
                                />
                                <strong>{formData.accent_color}</strong>
                                <button 
                                    onClick={() => setEditingField('accent_color')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Branding Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Branding</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Logo URL</label>
                        {editingField === 'logo_url' ? (
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={formData.logo_url}
                                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                                    placeholder="Enter logo URL"
                                    className="form-input"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('logo_url')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('logo_url')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                {formData.logo_url && (
                                    <img 
                                        src={formData.logo_url} 
                                        alt="Logo" 
                                        className="logo-preview"
                                        style={{ maxWidth: '100px', marginRight: '10px' }}
                                    />
                                )}
                                <strong>{formData.logo_url || 'Not set'}</strong>
                                <button 
                                    onClick={() => setEditingField('logo_url')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Favicon URL</label>
                        {editingField === 'favicon_url' ? (
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={formData.favicon_url}
                                    onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                                    placeholder="Enter favicon URL"
                                    className="form-input"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('favicon_url')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('favicon_url')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.favicon_url || 'Not set'}</strong>
                                <button 
                                    onClick={() => setEditingField('favicon_url')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Layout Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Layout</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Font Family</label>
                        {editingField === 'font_family' ? (
                            <div className="input-group">
                                <select
                                    value={formData.font_family}
                                    onChange={(e) => handleInputChange('font_family', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                </select>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('font_family')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('font_family')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.font_family}</strong>
                                <button 
                                    onClick={() => setEditingField('font_family')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Sidebar Position</label>
                        {editingField === 'sidebar_position' ? (
                            <div className="input-group">
                                <select
                                    value={formData.sidebar_position}
                                    onChange={(e) => handleInputChange('sidebar_position', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('sidebar_position')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('sidebar_position')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.sidebar_position}</strong>
                                <button 
                                    onClick={() => setEditingField('sidebar_position')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Dashboard Layout</label>
                        {editingField === 'dashboard_layout' ? (
                            <div className="input-group">
                                <select
                                    value={formData.dashboard_layout}
                                    onChange={(e) => handleInputChange('dashboard_layout', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="grid">Grid</option>
                                    <option value="list">List</option>
                                    <option value="compact">Compact</option>
                                </select>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('dashboard_layout')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('dashboard_layout')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.dashboard_layout}</strong>
                                <button 
                                    onClick={() => setEditingField('dashboard_layout')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Show Breadcrumbs</label>
                        <p>Display navigation breadcrumbs</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.show_breadcrumbs}
                            onChange={(e) => {
                                handleInputChange('show_breadcrumbs', e.target.checked);
                                handleSave('show_breadcrumbs');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.show_breadcrumbs ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Enable Animations</label>
                        <p>Enable UI animations and transitions</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.enable_animations}
                            onChange={(e) => {
                                handleInputChange('enable_animations', e.target.checked);
                                handleSave('enable_animations');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.enable_animations ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
            </div>

            {/* Localization Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Localization</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Language</label>
                        {editingField === 'language' ? (
                            <div className="input-group">
                                <select
                                    value={formData.language}
                                    onChange={(e) => handleInputChange('language', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="sw">Swahili</option>
                                </select>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('language')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('language')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.language.toUpperCase()}</strong>
                                <button 
                                    onClick={() => setEditingField('language')}
                                    className="action-btn"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Appearance;
