import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/Styles.css';
import ViewList from './viewlist';
import Sidebar from './sidebar';
function Reports() {
  const [showViewList, setShowViewList] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [counts, setCounts] = useState({
    totalStudents: 0,
    activeCourses: 0,
    attendanceRate: 0,
    atRiskStudents: 0
  });

  const reportsData = [
    {
      course: 'CS101',
      date: 'May 15, 2023',
      totalStudents: 45,
      present: 42,
      absent: 3,
      attendance: '93.3%',
      status: 'Complete',
    },
    {
      course: 'MATH201',
      date: 'May 15, 2023',
      totalStudents: 38,
      present: 35,
      absent: 3,
      attendance: '92.1%',
      status: 'Complete',
    },
  ];

  const atRiskStudents = [
    { id: 1, name: 'Student A' },
    { id: 2, name: 'Student B' },
  ];

  useEffect(() => {
    // Animate the numbers when component mounts
    const targetCounts = {
      totalStudents: 2456,
      activeCourses: 156,
      attendanceRate: 87.3,
      atRiskStudents: atRiskStudents.length
    };

    const duration = 1000; // Animation duration in ms
    const steps = 50; // Number of steps in the animation
    const stepValues = {};

    // Calculate step values for each counter
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
  }, []);

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