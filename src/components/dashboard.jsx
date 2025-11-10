import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/Styles.css';
import { FaUserCircle } from 'react-icons/fa';
function Dashboard() {
  const [counts, setCounts] = useState({
    students: 0,
    lecturers: 0,
    venues: 0,
    classes: 0
  });

  useEffect(() => {
    // Animation duration in milliseconds
    const duration = 2000;
    const startTime = Date.now();
    
    const targetValues = {
      students: 2458,
      lecturers: 142,
      venues: 36,
      classes: 18
    };

    const animateCount = () => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / duration);
      
      setCounts({
        students: Math.floor(progress * targetValues.students),
        lecturers: Math.floor(progress * targetValues.lecturers),
        venues: Math.floor(progress * targetValues.venues),
        classes: Math.floor(progress * targetValues.classes)
      });

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        // Ensure we end exactly at the target numbers
        setCounts(targetValues);
      }
    };

    animateCount();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2>UniAttend</h2>
        <ul>
          <li className="active">Dashboard</li>
          <li><Link to="/users">User Management</Link></li>
          <li><Link to="/venues">Venues & Beacons</Link></li>
          <li><Link to="/scheduling">Class Scheduling</Link></li>
          <li><Link to="/reports">Attendance Reports</Link></li>
        </ul>
        <h3>ADMIN</h3>
        <ul>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/security">Security</Link></li>
          <li><Link to="/admin-profile">Admin Profile</Link></li>
        </ul>
        
        <div className="admin-user">
        <FaUserCircle size={30} />
  Admin User<br />
  System Administrator
</div>
      </div>

      <div className="content">
        <h1>Dashboard Overview</h1>
        <div className="dashboard-overview">
          <div className="card">
            <h3>Total Students</h3>
            <p>{counts.students.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3>Total Lecturers</h3>
            <p>{counts.lecturers.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3>Total Venues</h3>
            <p>{counts.venues.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3>Active Classes</h3>
            <p>{counts.classes.toLocaleString()}</p>
          </div>
        </div>

        <div className="card recent-activity">
          <div className="card-header">
            <h2 className="card-title">Recent Activity</h2>
            <button className="btn btn-outline">View All</button>
          </div>
          
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon user">👤</div>
              <div className="activity-details">
                <p className="activity-title">John Smith registered</p>
                <p className="activity-subtext">Student</p>
              </div>
              <div className="activity-time">2m ago</div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon attendance">📊</div>
              <div className="activity-details">
                <p className="activity-title">CS101 Attendance Updated</p>
                <p className="activity-subtext">45/50 Students Present</p>
              </div>
              <div className="activity-time">15m ago</div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon warning">⚠️</div>
              <div className="activity-details">
                <p className="activity-title">A Beacon Offline</p>
                <p className="activity-subtext">Engineering Block B</p>
              </div>
              <div className="activity-time">32m ago</div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon schedule">📅</div>
              <div className="activity-details">
                <p className="activity-title">New Class Scheduled</p>
                <p className="activity-subtext">MATH202</p>
              </div>
              <div className="activity-time">1h ago</div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon add">➕</div>
              <div className="activity-details">
                <p className="activity-title">New Lecturer Added</p>
                <p className="activity-subtext">Dr. Sarah Johnson</p>
              </div>
              <div className="activity-time">2h ago</div>
            </div>
          </div>
        </div>

        <div className="card today-classes">
          <div className="card-header">
            <h2 className="card-title">Today's Classes</h2>
            <button className="btn btn-outline">View Schedule</button>
          </div>
          
          <div className="class-list">
            <div className="class-item">
              <div className="class-details">
                <h3 className="class-title">CS101: Introduction to Programming</h3>
                <p className="class-meta">
                  <span className="class-time">09:00 - 11:00</span>
                  <span className="class-location">Lecture Hall A</span>
                  <span className="class-lecturer">Dr. Johnson</span>
                </p>
              </div>
              <div className="class-actions">
                <button className="action-btn" title="View Details">
                  <span role="img" aria-label="View">👁️</span>
                </button>
              </div>
            </div>
            
            <div className="class-item">
              <div className="class-details">
                <h3 className="class-title">BIO205: Molecular Biology</h3>
                <p className="class-meta">
                  <span className="class-time">11:30 - 13:30</span>
                  <span className="class-location">Lab 3</span>
                  <span className="class-lecturer">Prof. Williams</span>
                </p>
              </div>
              <div className="class-actions">
                <button className="action-btn" title="View Details">
                  <span role="img" aria-label="View">👁️</span>
                </button>
              </div>
            </div>
            
            <div className="class-item">
              <div className="class-details">
                <h3 className="class-title">MATH202: Calculus II</h3>
                <p className="class-meta">
                  <span className="class-time">14:00 - 16:00</span>
                  <span className="class-location">Lecture Hall C</span>
                  <span className="class-lecturer">Dr. Martinez</span>
                </p>
              </div>
              <div className="class-actions">
                <button className="action-btn" title="View Details">
                  <span role="img" aria-label="View">👁️</span>
                </button>
              </div>
            </div>
            
            <div className="class-item">
              <div className="class-details">
                <h3 className="class-title">ENG304: Advanced Writing</h3>
                <p className="class-meta">
                  <span className="class-time">16:30 - 18:30</span>
                  <span className="class-location">Room 201</span>
                  <span className="class-lecturer">Prof. Thompson</span>
                </p>
              </div>
              <div className="class-actions">
                <button className="action-btn" title="View Details">
                  <span role="img" aria-label="View">👁️</span>
                </button>
              </div>
            </div>
          </div>
          <button style={{ float: 'right' }}>View All Classes</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;