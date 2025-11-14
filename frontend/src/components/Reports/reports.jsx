import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Styles.css';
import ViewList from '../Common/viewlist';
import Sidebar from '../Common/sidebar';
import { reportsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

function Reports() {
  const [showViewList, setShowViewList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [dateFilter, setDateFilter] = useState('last7days');
  const [counts, setCounts] = useState({
    totalStudents: 0,
    activeCourses: 0,
    attendanceRate: 0,
    atRiskStudents: 0
  });
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useApp();

  const atRiskStudents = [
    { id: 1, name: 'Student A', attendance: '65%' },
    { id: 2, name: 'Student B', attendance: '58%' },
  ];

  useEffect(() => {
    fetchReports();
  }, [dateFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetch attendance reports
      const response = await reportsAPI.attendance.overall({ 
        period: dateFilter 
      });
      
      const reportData = response.data.items || response.data.reports || [];
      setReportsData(reportData);
      
      // Set stats from response
      setCounts({
        totalStudents: response.data.totalStudents || response.data.stats?.totalStudents || 0,
        activeCourses: response.data.activeCourses || response.data.stats?.activeCourses || 0,
        attendanceRate: response.data.averageAttendance || response.data.stats?.averageAttendance || 0,
        atRiskStudents: response.data.atRiskCount || response.data.stats?.atRiskCount || atRiskStudents.length
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      
      // If API fails, show empty state with default values
      setReportsData([]);
      setCounts({
        totalStudents: 0,
        activeCourses: 0,
        attendanceRate: 0,
        atRiskStudents: 0
      });
      
      // Only show error if it's not a 404 (endpoint might not exist yet)
      if (error.response?.status !== 404) {
        addNotification('Failed to load reports', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewListClick = () => {
    setShowViewList(true);
  };

  const handleCloseViewList = () => {
    setShowViewList(false);
  };

  const handleGenerateReport = () => {
    addNotification('Generating report...', 'info');
    // TODO: Implement report generation
  };

  const handleExportData = () => {
    try {
      // Create CSV content
      const headers = ['Course', 'Date', 'Total Students', 'Present', 'Absent', 'Attendance %', 'Status'];
      const csvContent = [
        headers.join(','),
        ...filteredReports.map(report => [
          report.course,
          report.date,
          report.totalStudents,
          report.present,
          report.absent,
          report.attendance,
          report.status
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      addNotification('Report exported successfully', 'success');
    } catch (error) {
      addNotification('Failed to export report', 'error');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredReports = reportsData.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (report.course && report.course.toLowerCase().includes(searchLower)) ||
      (report.date && report.date.toLowerCase().includes(searchLower)) ||
      (report.status && report.status.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="reports-container">
      <Sidebar />
      <div className="content">
        <div className="breadcrumbs">
          <Link to="/dashboard">Dashboard</Link> <span>&gt;</span> <span>Attendance Reports</span>
        </div>
        
        <div className="page-header">
          <h1 className="page-title">Attendance Reports</h1>
          <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary report-action-btn" 
              onClick={handleGenerateReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
            >
              <span style={{ fontSize: '20px' }}>📊</span>
              <span>Generate Report</span>
            </button>
            <button 
              className="btn btn-success report-action-btn" 
              onClick={handleExportData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(17, 153, 142, 0.4)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(17, 153, 142, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(17, 153, 142, 0.4)';
              }}
            >
              <span style={{ fontSize: '20px' }}>📤</span>
              <span>Export Data</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {['Overview', 'Course Reports', 'Student Reports', 'Export'].map((tab) => (
            <button
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Overview Cards */}
        <div className="report-overview">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <span>👥</span>
            </div>
            <div className="stat-content">
              <h3>Total Students</h3>
              <p className="stat-number">{counts.totalStudents.toLocaleString()}</p>
              <p className="stat-label">Enrolled in active courses</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <span>📚</span>
            </div>
            <div className="stat-content">
              <h3>Active Courses</h3>
              <p className="stat-number">{counts.activeCourses}</p>
              <p className="stat-label">Currently in session</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <span>✓</span>
            </div>
            <div className="stat-content">
              <h3>Attendance Rate</h3>
              <p className="stat-number">{counts.attendanceRate}%</p>
              <p className="stat-label">Average across all courses</p>
            </div>
          </div>
          
          <div className="stat-card alert-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
              <span>⚠️</span>
            </div>
            <div className="stat-content">
              <h3>At-Risk Students</h3>
              <p className="stat-number">{counts.atRiskStudents}</p>
              <p className="stat-label">Below 75% attendance</p>
              <button className="btn btn-sm btn-warning" onClick={handleViewListClick}>
                View List
              </button>
            </div>
          </div>
        </div>

        {/* Recent Attendance Section */}
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Recent Attendance</h2>
            <div className="date-filter-buttons">
              <button 
                className={`btn btn-sm ${dateFilter === 'last7days' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setDateFilter('last7days')}
              >
                Last 7 Days
              </button>
              <button 
                className={`btn btn-sm ${dateFilter === 'last30days' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setDateFilter('last30days')}
              >
                Last 30 Days
              </button>
              <button 
                className={`btn btn-sm ${dateFilter === 'semester' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setDateFilter('semester')}
              >
                This Semester
              </button>
            </div>
          </div>

          <div className="card-body">
            <div className="search-bar" style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Search by course, date, or status..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              <button className="search-btn">🔍</button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Total Students</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Attendance %</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        Loading reports...
                      </td>
                    </tr>
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report, index) => (
                      <tr key={index}>
                        <td><strong>{report.course}</strong></td>
                        <td>{report.date}</td>
                        <td>{report.totalStudents}</td>
                        <td><span style={{ color: '#28a745', fontWeight: '600' }}>{report.present}</span></td>
                        <td><span style={{ color: '#dc3545', fontWeight: '600' }}>{report.absent}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ 
                              width: '60px', 
                              height: '8px', 
                              background: '#e9ecef', 
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{ 
                                width: report.attendance, 
                                height: '100%', 
                                background: parseInt(report.attendance) >= 75 ? '#28a745' : '#dc3545',
                                borderRadius: '4px'
                              }}></div>
                            </div>
                            <span style={{ fontWeight: '600' }}>{report.attendance}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${report.status === 'Complete' ? 'badge-success' : 'badge-warning'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button className="action-btn" title="View details">👁️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {showViewList && <ViewList students={atRiskStudents} onClose={handleCloseViewList} />}
    </div>
  );
}

export default Reports;

