import React, { useState, useEffect } from 'react';
import './css/Styles.css';
import Sidebar from './sidebar';
import { dashboardAPI } from '../services/api';
import { useApp } from '../context/AppContext';

function Dashboard() {
  const [counts, setCounts] = useState({
    students: 0,
    lecturers: 0,
    venues: 0,
    classes: 0
  });
  const [loading, setLoading] = useState(true);
  const { addNotification } = useApp();

  useEffect(() => {
    let isMounted = true;
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.error('Dashboard stats request timeout');
        addNotification('Request timeout - using cached data', 'warning');
        setLoading(false);
        // Use fallback data on timeout
        animateCounters({
          students: 0,
          lecturers: 0,
          venues: 0,
          classes: 0
        });
      }
    }, 10000); // 10 second timeout

    const fetchDashboardStats = async () => {
      try {
        const response = await dashboardAPI.getStats();
        
        if (!isMounted) return; // Component unmounted, don't update state
        
        clearTimeout(timeoutId);
        const stats = response.data;
        
        // Animate the counters with real data from DB
        animateCounters({
          students: stats.totalStudents || 0,
          lecturers: stats.totalLecturers || 0,
          venues: stats.totalVenues || 0,
          classes: stats.totalBeacons || 0
        });
        
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;
        
        clearTimeout(timeoutId);
        console.error('Error fetching dashboard stats:', error);
        
        const errorMsg = error.response?.data?.message || error.message || 'Failed to load dashboard statistics';
        addNotification(errorMsg, 'error');
        setLoading(false);
        
        // Show zero counts on error
        animateCounters({
          students: 0,
          lecturers: 0,
          venues: 0,
          classes: 0
        });
      }
    };

    const animateCounters = (targetValues) => {
      const duration = 2000;
      const startTime = Date.now();

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
    };

    fetchDashboardStats();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNotification]);

  return (
    <div className="dashboard-container">
   
<Sidebar/>
      <div className="content">
        <h1>Dashboard Overview</h1>
        {loading ? (
          <div className="loading">Loading dashboard...</div>
        ) : (
          <>
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
                <h3>Active Beacons</h3>
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
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;