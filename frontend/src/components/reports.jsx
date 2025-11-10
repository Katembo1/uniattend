import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/Styles.css';
import ViewList from './viewlist';
import Sidebar from './sidebar';
import { reportsAPI } from '../services/api';
import { useApp } from '../context/AppContext';

function Reports() {
  const [showViewList, setShowViewList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [counts, setCounts] = useState({
    totalStudents: 0,
    activeCourses: 0,
    attendanceRate: 0,
    atRiskStudents: 0
  });
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { addNotification } = useApp();
  const MAX_RETRIES = 3;

  const atRiskStudents = [
    { id: 1, name: 'Student A' },
    { id: 2, name: 'Student B' },
  ];

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Load once on mount

  const fetchReports = async (isRetry = false) => {
    if (loading) return;
    
    if (isRetry && retryCount >= MAX_RETRIES) {
      addNotification('Maximum retry attempts reached', 'error');
      return;
    }
    
    setLoading(true);
    const timeoutId = setTimeout(() => {
      console.error('Reports fetch timeout');
      setLoading(false);
      if (retryCount < MAX_RETRIES) {
        addNotification('Request timeout - retrying...', 'warning');
        setRetryCount(prev => prev + 1);
      }
    }, 8000);

    try {
      const response = await reportsAPI.getAttendance();
      clearTimeout(timeoutId);
      
      setReportsData(response.data.items || response.data || []);
      
      // Animate stats
      animateCounters({
        totalStudents: response.data.totalStudents || 0,
        activeCourses: response.data.activeCourses || 0,
        attendanceRate: response.data.averageAttendance || 0,
        atRiskStudents: response.data.atRiskCount || atRiskStudents.length
      });
      
      setRetryCount(0);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error fetching reports:', error);
      
      if (retryCount < MAX_RETRIES) {
        addNotification(`Failed to load reports - Retry ${retryCount + 1}/${MAX_RETRIES}`, 'warning');
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchReports(true), 2000);
      } else {
        addNotification('Failed to load reports', 'error');
        // Use zero values on failure
        animateCounters({
          totalStudents: 0,
          activeCourses: 0,
          attendanceRate: 0,
          atRiskStudents: atRiskStudents.length
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const animateCounters = (targetCounts) => {
    const duration = 1000;
    const steps = 50;
    const stepValues = {};

    Object.keys(targetCounts).forEach(key => {
      stepValues[key] = targetCounts[key] / steps;
    });

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(interval);
        setCounts(targetCounts);
      } else {
        setCounts(prev => ({
          totalStudents: Math.round(prev.totalStudents + stepValues.totalStudents),
          activeCourses: Math.round(prev.activeCourses + stepValues.activeCourses),
          attendanceRate: parseFloat((prev.attendanceRate + stepValues.attendanceRate).toFixed(1)),
          atRiskStudents: Math.round(prev.atRiskStudents + stepValues.atRiskStudents)
        }));
      }
    }, duration / steps);

    return () => clearInterval(interval);
  };

  const handleViewListClick = () => {
    setShowViewList(true);
  };

  const handleCloseViewList = () => {
    setShowViewList(false);
  };

  const handleGenerateReport = () => {
    console.log('Generating report...');
  };

  const handleExportData = () => {
    console.log('Exporting data...');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredReports = reportsData.filter((report) => {
    return (
      report.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.date.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="reports-container">
      <Sidebar />
      <div className="content">
        <div className="breadcrumbs">
          <Link to="/">Dashboard</Link> <span>&gt;</span> <span>Attendance Reports</span>
        </div>
        <div className="reports-header">
          <h1>Attendance Reports</h1>
        </div>
        <div className="reports-filters">
          <button className="active">Overview</button>
          <button>Course Reports</button>
          <button>Student Reports</button>
          <button>Export</button>
        </div>
        <div className="report-overview">
          <div className="card">
            <h3>TOTAL STUDENTS</h3>
            <p className="count-animate">{counts.totalStudents.toLocaleString()}</p>
            <p>Enrolled in active courses</p>
          </div>
          <div className="card">
            <h3>ACTIVE COURSES</h3>
            <p className="count-animate">{counts.activeCourses}</p>
            <p>Currently in session</p>
          </div>
          <div className="card">
            <h3>ATTENDANCE RATE</h3>
            <p className="count-animate">{counts.attendanceRate}%</p>
            <p>Average across all courses</p>
          </div>
          <div className="card">
            <h3>AT-RISK STUDENTS</h3>
            <p className="count-animate">{counts.atRiskStudents}</p>
            <p>Below 75% attendance</p>
            <button onClick={handleViewListClick}>View List</button>
          </div>
        </div>
        <div className="recent-attendance">
          <h2>Recent Attendance</h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by course or student..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <button className="search-btn">Search</button>
          </div>
          <div className="reports-filters">
            <button className="active">Last 7 days</button>
            <button>Last 30 days</button>
            <button>This Semester</button>
          </div>
          <div className="reports-actions">
            <button onClick={handleGenerateReport}>
              <span>📊</span> Generate Report
            </button>
            <button onClick={handleExportData}>
              <span>📤</span> Export Data
            </button>
          </div>
          <div className="table-responsive">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Total Students</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report, index) => (
                  <tr key={index}>
                    <td>{report.course}</td>
                    <td>{report.date}</td>
                    <td>{report.totalStudents}</td>
                    <td>{report.present}</td>
                    <td>{report.absent}</td>
                    <td>{report.attendance}</td>
                    <td>
                      <span className={`badge ${report.status === 'Complete' ? 'badge-success' : 'badge-warning'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button className="action-btn" title="View details">👁️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showViewList && <ViewList students={atRiskStudents} onClose={handleCloseViewList} />}
    </div>
  );
}

export default Reports;