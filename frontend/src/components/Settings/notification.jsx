import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../css/Styles.css';

function Notifications() {
    const [loading, setLoading] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [formData, setFormData] = useState({
        email_notifications_enabled: true,
        sms_notifications_enabled: false,
        slack_notifications_enabled: false,
        low_attendance_alert: true,
        attendance_report_frequency: 'weekly',
        notification_email: '',
        sms_gateway_enabled: false,
        slack_webhook_url: '',
        alert_threshold_percentage: '70',
        send_daily_report: false,
        send_weekly_summary: true,
        admin_alert_enabled: true
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
                email_notifications_enabled: settingsData.email_notifications_enabled !== 'false',
                sms_notifications_enabled: settingsData.sms_notifications_enabled === 'true',
                slack_notifications_enabled: settingsData.slack_notifications_enabled === 'true',
                low_attendance_alert: settingsData.low_attendance_alert !== 'false',
                attendance_report_frequency: settingsData.attendance_report_frequency || 'weekly',
                notification_email: settingsData.notification_email || '',
                sms_gateway_enabled: settingsData.sms_gateway_enabled === 'true',
                slack_webhook_url: settingsData.slack_webhook_url || '',
                alert_threshold_percentage: settingsData.alert_threshold_percentage || '70',
                send_daily_report: settingsData.send_daily_report === 'true',
                send_weekly_summary: settingsData.send_weekly_summary !== 'false',
                admin_alert_enabled: settingsData.admin_alert_enabled !== 'false'
            };

            setFormData(newFormData);
            setOriginalFormData(newFormData);
            addNotification('Notification settings loaded successfully', 'success');
        } catch (error) {
            console.error('Error fetching settings:', error);
            addNotification('Failed to load notification settings', 'error');
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

    if (loading && !formData.notification_email) {
        return <div className="loading">Loading notification settings...</div>;
    }

    return (
        <div className="settings-container">
            <h2 className="card-title">Notification Settings</h2>

            {/* Email Notifications Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Email Notifications</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Enable Email Notifications</label>
                        <p>Send notifications via email</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.email_notifications_enabled}
                            onChange={(e) => {
                                handleInputChange('email_notifications_enabled', e.target.checked);
                                handleSave('email_notifications_enabled');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.email_notifications_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Notification Email Address</label>
                        {editingField === 'notification_email' ? (
                            <div className="input-group">
                                <input
                                    type="email"
                                    value={formData.notification_email}
                                    onChange={(e) => handleInputChange('notification_email', e.target.value)}
                                    placeholder="Enter email address"
                                    className="form-input"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('notification_email')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('notification_email')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.notification_email || 'Not set'}</strong>
                                <button 
                                    onClick={() => setEditingField('notification_email')}
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
                        <label>Report Frequency</label>
                        {editingField === 'attendance_report_frequency' ? (
                            <div className="input-group">
                                <select
                                    value={formData.attendance_report_frequency}
                                    onChange={(e) => handleInputChange('attendance_report_frequency', e.target.value)}
                                    className="form-input"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('attendance_report_frequency')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('attendance_report_frequency')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.attendance_report_frequency}</strong>
                                <button 
                                    onClick={() => setEditingField('attendance_report_frequency')}
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
                        <label>Send Daily Report</label>
                        <p>Automatically send daily attendance reports</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.send_daily_report}
                            onChange={(e) => {
                                handleInputChange('send_daily_report', e.target.checked);
                                handleSave('send_daily_report');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.send_daily_report ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Send Weekly Summary</label>
                        <p>Automatically send weekly summary reports</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.send_weekly_summary}
                            onChange={(e) => {
                                handleInputChange('send_weekly_summary', e.target.checked);
                                handleSave('send_weekly_summary');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.send_weekly_summary ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
            </div>

            {/* SMS Notifications Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">SMS Notifications</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Enable SMS Notifications</label>
                        <p>Send notifications via SMS</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.sms_notifications_enabled}
                            onChange={(e) => {
                                handleInputChange('sms_notifications_enabled', e.target.checked);
                                handleSave('sms_notifications_enabled');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.sms_notifications_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>SMS Gateway Enabled</label>
                        <p>Configure SMS gateway provider</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.sms_gateway_enabled}
                            onChange={(e) => {
                                handleInputChange('sms_gateway_enabled', e.target.checked);
                                handleSave('sms_gateway_enabled');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.sms_gateway_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
            </div>

            {/* Slack Integration Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Slack Integration</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Enable Slack Notifications</label>
                        <p>Send notifications to Slack channel</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.slack_notifications_enabled}
                            onChange={(e) => {
                                handleInputChange('slack_notifications_enabled', e.target.checked);
                                handleSave('slack_notifications_enabled');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.slack_notifications_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Slack Webhook URL</label>
                        {editingField === 'slack_webhook_url' ? (
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={formData.slack_webhook_url}
                                    onChange={(e) => handleInputChange('slack_webhook_url', e.target.value)}
                                    placeholder="https://hooks.slack.com/services/..."
                                    className="form-input"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('slack_webhook_url')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('slack_webhook_url')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.slack_webhook_url ? '••••••••••••' : 'Not set'}</strong>
                                <button 
                                    onClick={() => setEditingField('slack_webhook_url')}
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

            {/* Alert Settings Section */}
            <div className="settings-section">
                <h3 className="section-subtitle">Alert Settings</h3>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Low Attendance Alert</label>
                        <p>Receive alerts when attendance drops below threshold</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.low_attendance_alert}
                            onChange={(e) => {
                                handleInputChange('low_attendance_alert', e.target.checked);
                                handleSave('low_attendance_alert');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.low_attendance_alert ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>

                <div className="setting-item">
                    <div className="setting-details">
                        <label>Alert Threshold (%)</label>
                        {editingField === 'alert_threshold_percentage' ? (
                            <div className="input-group">
                                <input
                                    type="number"
                                    value={formData.alert_threshold_percentage}
                                    onChange={(e) => handleInputChange('alert_threshold_percentage', e.target.value)}
                                    placeholder="Enter percentage"
                                    className="form-input"
                                    min="0"
                                    max="100"
                                />
                                <div className="action-buttons">
                                    <button 
                                        onClick={() => handleSave('alert_threshold_percentage')}
                                        className="btn btn-success"
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        onClick={() => handleCancel('alert_threshold_percentage')}
                                        className="btn btn-outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="display-field">
                                <strong>{formData.alert_threshold_percentage}%</strong>
                                <button 
                                    onClick={() => setEditingField('alert_threshold_percentage')}
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
                        <label>Admin Alerts</label>
                        <p>Send critical alerts to admin users</p>
                    </div>
                    <div className="toggle-field">
                        <input
                            type="checkbox"
                            checked={formData.admin_alert_enabled}
                            onChange={(e) => {
                                handleInputChange('admin_alert_enabled', e.target.checked);
                                handleSave('admin_alert_enabled');
                            }}
                            className="toggle-checkbox"
                        />
                        <span>{formData.admin_alert_enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Notifications;
