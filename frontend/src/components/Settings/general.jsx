import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../css/Styles.css';

function General() {
    const [loading, setLoading] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        institution_name: '',
        academic_year: '',
        institution_email: '',
        institution_phone: '',
        max_students_per_class: '',
        attendance_threshold: '',
        session_timeout: '',
        system_mode: 'production'
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
                institution_name: settingsData.institution_name || '',
                academic_year: settingsData.academic_year || new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
                institution_email: settingsData.institution_email || '',
                institution_phone: settingsData.institution_phone || '',
                max_students_per_class: settingsData.max_students_per_class || '150',
                attendance_threshold: settingsData.attendance_threshold || '75',
                session_timeout: settingsData.session_timeout || '30',
                system_mode: settingsData.system_mode || 'production'
            };

            setFormData(newFormData);
            setOriginalFormData(newFormData);
            addNotification('Settings loaded successfully', 'success');
        } catch (error) {
            console.error('Error fetching settings:', error);
            addNotification('Failed to load settings', 'error');
        } finally {
            setLoading(false);
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
                [field]: formData[field]
            };

            await settingsAPI.bulkUpdate(updateData);
            setOriginalFormData(prev => ({
                ...prev,
                [field]: formData[field]
            }));
            setEditingField(null);
            addNotification(`${field} updated successfully`, 'success');
        } catch (error) {
            console.error('Error updating setting:', error);
            addNotification('Failed to update setting', 'error');
            // Revert changes
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

    if (loading && Object.values(formData).every(v => !v)) {
        return <div className="loading">Loading settings...</div>;
    }

    return (
        <div className="settings-container">
            <h2 className="card-title">General Settings</h2>
            
            {/* Institution Details Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Institution Information</h3>
                
                <div className="setting-item">
                    <div className="setting-details">
                        <label>Institution Name</label>
                        {editingField === 'institution_name' ? (
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={formData.institution_name}
                                    onChange={(e) => handleInputChange('institution_name', e.target.value)}
                                    placeholder="Enter institution name"
                                    className="form-input"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('institution_name')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('institution_name')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.institution_name || 'Not set'}</strong>
                                <button 
                                    onClick={() => setEditingField('institution_name')}
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
                        <label>Academic Year</label>
                        {editingField === 'academic_year' ? (
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={formData.academic_year}
                                    onChange={(e) => handleInputChange('academic_year', e.target.value)}
                                    placeholder="e.g., 2023-2024"
                                    className="form-input"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('academic_year')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('academic_year')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.academic_year}</strong>
                                <button 
                                    onClick={() => setEditingField('academic_year')}
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
                        <label>Institution Email</label>
                        {editingField === 'institution_email' ? (
                            <div className="input-group">
                                <input
                                    type="email"
                                    value={formData.institution_email}
                                    onChange={(e) => handleInputChange('institution_email', e.target.value)}
                                    placeholder="Enter institution email"
                                    className="form-input"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('institution_email')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('institution_email')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.institution_email || 'Not set'}</strong>
                                <button 
                                    onClick={() => setEditingField('institution_email')}
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
                        <label>Institution Phone</label>
                        {editingField === 'institution_phone' ? (
                            <div className="input-group">
                                <input
                                    type="tel"
                                    value={formData.institution_phone}
                                    onChange={(e) => handleInputChange('institution_phone', e.target.value)}
                                    placeholder="Enter phone number"
                                    className="form-input"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('institution_phone')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('institution_phone')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.institution_phone || 'Not set'}</strong>
                                <button 
                                    onClick={() => setEditingField('institution_phone')}
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

            {/* System Configuration Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">System Configuration</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Max Students Per Class</label>
                        {editingField === 'max_students_per_class' ? (
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={formData.max_students_per_class}
                                    onChange={(e) => handleInputChange('max_students_per_class', e.target.value)}
                                    placeholder="Enter maximum number"
                                    className="form-input"
                                    min="1"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('max_students_per_class')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('max_students_per_class')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.max_students_per_class}</strong>
                                <button 
                                    onClick={() => setEditingField('max_students_per_class')}
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
                        <label>Attendance Threshold (%)</label>
                        {editingField === 'attendance_threshold' ? (
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={formData.attendance_threshold}
                                    onChange={(e) => handleInputChange('attendance_threshold', e.target.value)}
                                    placeholder="Enter percentage"
                                    className="form-input"
                                    min="0"
                                    max="100"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('attendance_threshold')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('attendance_threshold')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.attendance_threshold}%</strong>
                                <button 
                                    onClick={() => setEditingField('attendance_threshold')}
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
                        <label>Session Timeout (minutes)</label>
                        {editingField === 'session_timeout' ? (
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={formData.session_timeout}
                                    onChange={(e) => handleInputChange('session_timeout', e.target.value)}
                                    placeholder="Enter timeout in minutes"
                                    className="form-input"
                                    min="5"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('session_timeout')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('session_timeout')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.session_timeout} minutes</strong>
                                <button 
                                    onClick={() => setEditingField('session_timeout')}
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
                        <label>System Mode</label>
                        {editingField === 'system_mode' ? (
                            <div className="input-group">
                                <select
                                    value={formData.system_mode}
                                    onChange={(e) => handleInputChange('system_mode', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="production">Production</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="testing">Testing</option>
                                </select>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('system_mode')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('system_mode')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.system_mode}</strong>
                                <button 
                                    onClick={() => setEditingField('system_mode')}
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

export default General;
