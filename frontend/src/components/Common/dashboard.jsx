import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Styles.css';
import Sidebar from '../Common/sidebar';
import { dashboardAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

function Dashboard() {
  const [counts, setCounts] = useState({
    students: 0,
    lecturers: 0,
    venues: 0,
    classes: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const { addNotification } = useApp();
  const navigate = useNavigate();

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
        
        // Only show notification for critical network errors, not for every failed request
        if (!error.response && error.message === 'Network Error') {
          // Network is down - show a single notification
          addNotification('Unable to connect to server. Please check your connection.', 'error');
        }
        
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

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setActivitiesLoading(true);
        const response = await dashboardAPI.getRecentActivity({ per_page: 5 });
        setRecentActivities(response.data.items || []);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        // Silently fail - activities are not critical
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  // Fetch today's classes
  useEffect(() => {
    const fetchTodayClasses = async () => {
      try {
        setClassesLoading(true);
        const response = await dashboardAPI.getTodayClasses();
        setTodayClasses(response.data.items || []);
      } catch (error) {
        console.error('Error fetching today\'s classes:', error);
        // Silently fail - classes are not critical
      } finally {
        setClassesLoading(false);
      }
    };

    fetchTodayClasses();
  }, []);

  const getActivityIcon = (actionType, entityType) => {
    if (actionType === 'create') {
      if (entityType === 'user' || entityType === 'student' || entityType === 'lecturer') return '👤';
      if (entityType === 'venue' || entityType === 'class') return '🏛️';
      if (entityType === 'beacon') return '📡';
      if (entityType === 'timetable') return '📅';
      return '➕';
    }
    if (actionType === 'update') return '✏️';
    if (actionType === 'delete') return '🗑️';
    if (actionType === 'login') return '🔐';
    if (actionType === 'logout') return '🚪';
    return '📝';
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    const now = new Date();
    // Handle ISO format timestamps and ensure proper parsing
    const activityDate = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(activityDate.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return 'Invalid time';
    }
    
    const diffMs = now - activityDate;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 10) return 'just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return activityDate.toLocaleDateString();
  };

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
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/activities')}
                >
                  📊 View All
                </button>
              </div>
              
              <div className="activity-list">
                {activitiesLoading ? (
                  <div className="loading" style={{ padding: '2rem', textAlign: 'center' }}>
                    Loading activities...
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                    <p>No recent activities</p>
                    <p style={{ fontSize: '0.9rem' }}>Activities will appear here as users interact with the system</p>
                  </div>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon ${activity.action_type}`}>
                        {getActivityIcon(activity.action_type, activity.entity_type)}
                      </div>
                      <div className="activity-details">
                        <p className="activity-title">
                          {activity.description || `${activity.action_type} ${activity.entity_type}`}
                        </p>
                        <p className="activity-subtext">
                          {activity.username || 'System'} • {activity.entity_type || 'Unknown'}
                        </p>
                      </div>
                      <div className="activity-time">{formatTimeAgo(activity.created_at)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card today-classes">
              <div className="card-header">
                <h2 className="card-title">Today's Classes</h2>
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/schedules')}
                >
                  📅 View Schedule
                </button>
              </div>
              
              <div className="class-list">
                {classesLoading ? (
                  <div className="loading" style={{ padding: '2rem', textAlign: 'center' }}>
                    Loading today's classes...
                  </div>
                ) : todayClasses.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                    <p>No classes scheduled for today</p>
                    <p style={{ fontSize: '0.9rem' }}>Check back tomorrow or view the full schedule</p>
                  </div>
                ) : (
                  todayClasses.slice(0, 4).map((classItem) => (
                    <div key={classItem.id} className="class-item">
                      <div className="class-details">
                        <h3 className="class-title">
                          {classItem.unit_code}: {classItem.unit_name}
                        </h3>
                        <p className="class-meta">
                          <span className="class-time">
                            🕐 {classItem.start_time} - {classItem.end_time}
                          </span>
                          <span className="class-location">
                            🏛️ {classItem.venue_name}
                          </span>
                          <span className="class-lecturer">
                            👨‍🏫 {classItem.lecturer_title ? `${classItem.lecturer_title} ` : ''}{classItem.lecturer_name || 'TBA'}
                          </span>
                        </p>
                      </div>
                      {classItem.session_type && (
                        <div className="class-badge">
                          {classItem.session_type}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {!classesLoading && (
                <div style={{ 
                  marginTop: '1.5rem', 
                  paddingTop: '1rem',
                  borderTop: '1px solid #e0e0e0',
                  textAlign: 'center'
                }}>
                  <button 
                    className="btn btn-outline"
                    onClick={() => navigate('/classes')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}
                  >
                    📋 View All Classes
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;


