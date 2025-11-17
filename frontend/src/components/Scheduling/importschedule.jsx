import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../Common/sidebar';
import { timetableAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import '../css/Styles.css';

function ScheduleImport() {
    const navigate = useNavigate();
    const { addNotification } = useApp();
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [importResults, setImportResults] = useState(null);
    const [importMethod, setImportMethod] = useState('file'); // 'file' or 'json'
    const [jsonData, setJsonData] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.name.endsWith('.csv')) {
                addNotification('Please select a CSV file', 'error');
                return;
            }
            setSelectedFile(file);
            setImportResults(null);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            addNotification('Please select a file to upload', 'error');
            return;
        }

        setLoading(true);
        setImportResults(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await timetableAPI.importFile(formData);
            
            setImportResults({
                success: true,
                created: response.data.created,
                errors: response.data.errors || [],
                message: response.data.message
            });

            if (response.data.errors && response.data.errors.length > 0) {
                addNotification(`Imported ${response.data.created} entries with some errors`, 'warning');
            } else {
                addNotification(response.data.message, 'success');
            }

            // Clear file selection after successful import
            if (response.data.created > 0) {
                setSelectedFile(null);
                document.getElementById('fileInput').value = '';
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setImportResults({
                success: false,
                message: error.response?.data?.message || 'Failed to import schedule',
                errors: error.response?.data?.errors || []
            });
            addNotification(error.response?.data?.message || 'Failed to import schedule', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleJsonImport = async () => {
        if (!jsonData.trim()) {
            addNotification('Please enter JSON data', 'error');
            return;
        }

        setLoading(true);
        setImportResults(null);

        try {
            const entries = JSON.parse(jsonData);
            
            if (!Array.isArray(entries)) {
                throw new Error('JSON data must be an array of entries');
            }

            const response = await timetableAPI.bulkImport({ entries });
            
            setImportResults({
                success: true,
                created: response.data.created,
                errors: response.data.errors || [],
                message: response.data.message
            });

            if (response.data.errors && response.data.errors.length > 0) {
                addNotification(`Imported ${response.data.created} entries with some errors`, 'warning');
            } else {
                addNotification(response.data.message, 'success');
            }

            // Clear JSON data after successful import
            if (response.data.created > 0) {
                setJsonData('');
            }
        } catch (error) {
            console.error('Error importing JSON:', error);
            
            if (error instanceof SyntaxError) {
                addNotification('Invalid JSON format', 'error');
            } else {
                const errorMsg = error.response?.data?.message || error.message || 'Failed to import schedule';
                addNotification(errorMsg, 'error');
            }
            
            setImportResults({
                success: false,
                message: error.response?.data?.message || error.message || 'Failed to import schedule',
                errors: error.response?.data?.errors || []
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = 'unit_id,lecturer_id,class_id,day_of_week,start_time,end_time,session_type\n' +
                          '1,1,1,Monday,08:00:00,10:00:00,lecture\n' +
                          '2,2,2,Tuesday,10:00:00,12:00:00,lab';
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'timetable_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const showJsonExample = () => {
        const example = [
            {
                unitId: 1,
                lecturerId: 1,
                venueId: 1,
                dayOfWeek: 'Monday',
                startTime: '08:00:00',
                endTime: '10:00:00',
                sessionType: 'lecture'
            },
            {
                unitId: 2,
                lecturerId: 2,
                venueId: 2,
                dayOfWeek: 'Tuesday',
                startTime: '10:00:00',
                endTime: '12:00:00',
                sessionType: 'lab'
            }
        ];
        setJsonData(JSON.stringify(example, null, 2));
    };

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="content">
                <div className="breadcrumbs-container">
                    <div className="breadcrumbs">
                        <Link to="/dashboard">Dashboard</Link>
                        <span className="separator">›</span>
                        <Link to="/scheduling">Schedule</Link>
                        <span className="separator">›</span>
                        <span>Import Schedule</span>
                    </div>
                </div>

                <div className="page-header">
                    <h1>Import Schedule</h1>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/scheduling')}
                    >
                        Back to Schedule
                    </button>
                </div>

                {/* Import Method Selector */}
                <div className="card">
                    <div className="import-method-selector">
                        <button
                            className={`method-btn ${importMethod === 'file' ? 'active' : ''}`}
                            onClick={() => setImportMethod('file')}
                        >
                            📁 CSV File Upload
                        </button>
                        <button
                            className={`method-btn ${importMethod === 'json' ? 'active' : ''}`}
                            onClick={() => setImportMethod('json')}
                        >
                            📝 JSON Data
                        </button>
                    </div>
                </div>

                {/* CSV File Upload */}
                {importMethod === 'file' && (
                    <div className="card">
                        <h2>Upload CSV File</h2>
                        <div className="import-instructions">
                            <p>Upload a CSV file with the following columns:</p>
                            <ul>
                                <li><strong>unit_id</strong> or <strong>unitId</strong> - Unit/Course ID</li>
                                <li><strong>lecturer_id</strong> or <strong>lecturerId</strong> - Lecturer ID</li>
                                <li><strong>class_id</strong> or <strong>venueId</strong> - Venue/Class ID</li>
                                <li><strong>day_of_week</strong> or <strong>dayOfWeek</strong> - Day name (Monday, Tuesday, etc.)</li>
                                <li><strong>start_time</strong> or <strong>startTime</strong> - Start time (HH:MM:SS)</li>
                                <li><strong>end_time</strong> or <strong>endTime</strong> - End time (HH:MM:SS)</li>
                                <li><strong>session_type</strong> or <strong>sessionType</strong> - Session type (lecture, lab, tutorial, practical)</li>
                            </ul>
                            <button className="btn btn-secondary" onClick={downloadTemplate}>
                                📥 Download CSV Template
                            </button>
                        </div>

                        <div className="file-upload-section">
                            <input
                                id="fileInput"
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            {selectedFile && (
                                <div className="file-info">
                                    <p>✅ Selected file: <strong>{selectedFile.name}</strong></p>
                                    <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
                                </div>
                            )}
                            <button
                                className="btn btn-primary"
                                onClick={handleFileUpload}
                                disabled={!selectedFile || loading}
                            >
                                {loading ? 'Uploading...' : '📤 Upload & Import'}
                            </button>
                        </div>
                    </div>
                )}

                {/* JSON Data Import */}
                {importMethod === 'json' && (
                    <div className="card">
                        <h2>Import JSON Data</h2>
                        <div className="import-instructions">
                            <p>Paste JSON array with schedule entries. Each entry should have:</p>
                            <ul>
                                <li><strong>unitId</strong> - Unit/Course ID (number)</li>
                                <li><strong>lecturerId</strong> - Lecturer ID (number)</li>
                                <li><strong>venueId</strong> - Venue/Class ID (number)</li>
                                <li><strong>dayOfWeek</strong> - Day name (Monday, Tuesday, etc.)</li>
                                <li><strong>startTime</strong> - Start time (HH:MM:SS)</li>
                                <li><strong>endTime</strong> - End time (HH:MM:SS)</li>
                                <li><strong>sessionType</strong> - Session type (lecture, lab, tutorial, practical)</li>
                            </ul>
                            <button className="btn btn-secondary" onClick={showJsonExample}>
                                📋 Show Example JSON
                            </button>
                        </div>

                        <div className="json-input-section">
                            <textarea
                                className="json-textarea"
                                value={jsonData}
                                onChange={(e) => setJsonData(e.target.value)}
                                placeholder='[{"unitId": 1, "lecturerId": 1, "venueId": 1, "dayOfWeek": "Monday", "startTime": "08:00:00", "endTime": "10:00:00", "sessionType": "lecture"}]'
                                rows={15}
                            />
                            <button
                                className="btn btn-primary"
                                onClick={handleJsonImport}
                                disabled={!jsonData.trim() || loading}
                            >
                                {loading ? 'Importing...' : '📥 Import JSON Data'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Import Results */}
                {importResults && (
                    <div className={`card import-results ${importResults.success ? 'success' : 'error'}`}>
                        <h2>Import Results</h2>
                        <div className="result-summary">
                            <p className={importResults.success ? 'success-message' : 'error-message'}>
                                {importResults.message}
                            </p>
                            {importResults.created > 0 && (
                                <p className="success-count">
                                    ✅ Successfully imported: <strong>{importResults.created}</strong> entries
                                </p>
                            )}
                        </div>

                        {importResults.errors && importResults.errors.length > 0 && (
                            <div className="error-list">
                                <h3>Errors ({importResults.errors.length}):</h3>
                                <ul>
                                    {importResults.errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {importResults.success && importResults.created > 0 && (
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/scheduling')}
                            >
                                View Imported Schedule
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ScheduleImport;

