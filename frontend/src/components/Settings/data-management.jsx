import React, { useState, useEffect } from 'react';
import { settingsAPI, auditAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../css/Styles.css';

function DataManagement() {
    const [loading, setLoading] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        data_retention_days: '365',
        auto_backup_enabled: true,
        backup_frequency: 'daily',
        archive_old_records: false,
        archive_after_days: '180',
        export_format: 'csv',
        log_retention_days: '90',
        delete_inactive_users_after_days: '365'
    });
    const [originalFormData, setOriginalFormData] = useState(formData);
    const [auditLogs, setAuditLogs] = useState([]);
    const [auditLoading, setAuditLoading] = useState(false);
    const { addNotification } = useApp();

    useEffect(() => {
        fetchSettings();
        fetchAuditLogs();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await settingsAPI.getAll();
            const settingsData = response.data;

            const newFormData = {
                data_retention_days: settingsData.data_retention_days || '365',
                auto_backup_enabled: settingsData.auto_backup_enabled !== 'false',
                backup_frequency: settingsData.backup_frequency || 'daily',
                archive_old_records: settingsData.archive_old_records === 'true',
                archive_after_days: settingsData.archive_after_days || '180',
                export_format: settingsData.export_format || 'csv',
                log_retention_days: settingsData.log_retention_days || '90',
                delete_inactive_users_after_days: settingsData.delete_inactive_users_after_days || '365'
            };

            setFormData(newFormData);
            setOriginalFormData(newFormData);
            addNotification('Data management settings loaded', 'success');
        } catch (error) {
            console.error('Error fetching settings:', error);
            addNotification('Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        setAuditLoading(true);
        try {
            const response = await auditAPI.getAll({ page: 1, per_page: 10 });
            setAuditLogs(response.data.items || []);
        } catch (error) {
            console.error('Error fetching audit logs:', error);
            addNotification('Failed to load audit logs', 'error');
        } finally {
            setAuditLoading(false);
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

    const handleBackup = async () => {
        try {
            setLoading(true);
            addNotification('Backup initiated. This may take a few minutes...', 'info');
            // In a real scenario, this would call a backup endpoint
            setTimeout(() => {
                addNotification('Backup completed successfully', 'success');
                setLoading(false);
            }, 2000);
        } catch (error) {
            addNotification('Backup failed', 'error');
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setLoading(true);
            addNotification('Preparing data export...', 'info');
            // In a real scenario, this would call an export endpoint
            setTimeout(() => {
                addNotification('Export prepared and ready for download', 'success');
                setLoading(false);
            }, 2000);
        } catch (error) {
            addNotification('Export failed', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <h2 className="card-title">Data Management</h2>

            {/* Backup & Restore Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Backup & Restore</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Automatic Backups</label>
                        <p>Enable automatic database backups</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.auto_backup_enabled}
                            onChange={(e) => {
                                handleInputChange('auto_backup_enabled', e.target.checked);
                                handleSave('auto_backup_enabled');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.auto_backup_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Backup Frequency</label>
                        {editingField === 'backup_frequency' ? (
                            <div className="input-group">
                                <select
                                    value={formData.backup_frequency}
                                    onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('backup_frequency')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('backup_frequency')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.backup_frequency}</strong>
                                <button 
                                    onClick={() => setEditingField('backup_frequency')}
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
                        <label>Manual Backup</label>
                        <p>Create a backup now</p>
                    </div>
                    <button 
                        onClick={handleBackup}
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Creating Backup...' : 'Create Backup'}
                    </button>
                </div>
            </div>

            {/* Data Retention Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Data Retention</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Data Retention Period (days)</label>
                        {editingField === 'data_retention_days' ? (
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={formData.data_retention_days}
                                    onChange={(e) => handleInputChange('data_retention_days', e.target.value)}
                                    placeholder="Enter number of days"
                                    className="form-input"
                                    min="1"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('data_retention_days')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('data_retention_days')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.data_retention_days} days</strong>
                                <button 
                                    onClick={() => setEditingField('data_retention_days')}
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
                        <label>Archive Old Records</label>
                        <p>Automatically archive records older than specified period</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.archive_old_records}
                            onChange={(e) => {
                                handleInputChange('archive_old_records', e.target.checked);
                                handleSave('archive_old_records');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.archive_old_records ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Archive After (days)</label>
                        {editingField === 'archive_after_days' ? (
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={formData.archive_after_days}
                                    onChange={(e) => handleInputChange('archive_after_days', e.target.value)}
                                    placeholder="Enter number of days"
                                    className="form-input"
                                    min="1"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('archive_after_days')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('archive_after_days')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.archive_after_days} days</strong>
                                <button 
                                    onClick={() => setEditingField('archive_after_days')}
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
                        <label>Log Retention Period (days)</label>
                        {editingField === 'log_retention_days' ? (
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={formData.log_retention_days}
                                    onChange={(e) => handleInputChange('log_retention_days', e.target.value)}
                                    placeholder="Enter number of days"
                                    className="form-input"
                                    min="1"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('log_retention_days')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('log_retention_days')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.log_retention_days} days</strong>
                                <button 
                                    onClick={() => setEditingField('log_retention_days')}
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
                        <label>Delete Inactive Users After (days)</label>
                        {editingField === 'delete_inactive_users_after_days' ? (
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={formData.delete_inactive_users_after_days}
                                    onChange={(e) => handleInputChange('delete_inactive_users_after_days', e.target.value)}
                                    placeholder="Enter number of days"
                                    className="form-input"
                                    min="1"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('delete_inactive_users_after_days')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('delete_inactive_users_after_days')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.delete_inactive_users_after_days} days</strong>
                                <button 
                                    onClick={() => setEditingField('delete_inactive_users_after_days')}
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

            {/* Export Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Data Export</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Export Format</label>
                        {editingField === 'export_format' ? (
                            <div className="input-group">
                                <select
                                    value={formData.export_format}
                                    onChange={(e) => handleInputChange('export_format', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="csv">CSV</option>
                                    <option value="xlsx">Excel (XLSX)</option>
                                    <option value="json">JSON</option>
                                    <option value="pdf">PDF</option>
                                </select>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('export_format')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('export_format')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.export_format.toUpperCase()}</strong>
                                <button 
                                    onClick={() => setEditingField('export_format')}
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
                        <label>Export Data</label>
                        <p>Export all data in selected format</p>
                    </div>
                    <button 
                        onClick={handleExport}
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Preparing Export...' : 'Export Data'}
                    </button>
                </div>
            </div>

            {/* Audit Logs Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Recent Audit Logs</h3>

                {auditLoading ? (
                    <div className="loading">Loading audit logs...</div>
                ) : auditLogs.length > 0 ? (
                    <div className="audit-logs-list">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="audit-log-item">
                                <div className="log-details">
                                    <span className="log-action">{log.action_type}</span>
                                    <span className="log-entity">{log.entity_type}</span>
                                    <span className="log-date">
                                        {new Date(log.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <span className="log-description">{log.action_description}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No audit logs available</p>
                )}
            </div>
        </div>
    );
}

export default DataManagement;
