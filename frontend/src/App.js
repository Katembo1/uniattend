import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Common/sidebar';
import Login from './components/Auth/Login';
import AddBeacon from './components/Venues/add_beacon';
import AddVenue from './components/Venues/add_venue';
import Dashboard from './components/Common/dashboard';
import Reports from './components/Reports/reports';
import Scheduling from './components/Scheduling/scheduling';
import Security from './components/Settings/security';
import Settings from './components/Settings/settings';
import Users from './components/Users/users';
import Venues from './components/Venues/venues';
import AddNewUser from './components/Users/newuser';
import AddNewClass from './components/Scheduling/AddNewClass';
import ScheduleImport from './components/Scheduling/importschedule';
import ViewList from './components/Common/viewlist';
import AdminProfile from "./components/Auth/AdminProfile";
import UserManagement from "./components/Users/UserManagement";
import Activities from "./components/Common/activities";
import NotificationContainer from './components/Common/NotificationContainer';
import './App.css';

function AppContent() {
  const { addNotification } = useApp();
  
  useEffect(() => {
    document.title = 'UniAttend - Attendance Management';
    
    // Expose notification function globally for API interceptor
    window.showNotification = addNotification;
    
    return () => {
      document.title = 'UniAttend';
      window.showNotification = null;
    };
  }, [addNotification]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className={`App ${isMenuOpen ? 'menu-open' : ''}`}> {/* Add a class for styling */}
      <NotificationContainer />
      <header className="app-header">
        <button className="hamburger-menu" onClick={toggleMenu}>
          ☰
        </button>
      </header>

      <Sidebar isOpen={isMenuOpen} toggleMenu={toggleMenu} /> {/* Always render, toggle with isOpen prop */}

      <main className="app-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/add_beacon" element={<AddBeacon />} />
              <Route path="/add_venue" element={<AddVenue />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/scheduling" element={<Scheduling />} />
              <Route path="/security" element={<Security />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/users" element={<Users />} />
              <Route path="/venues" element={<Venues />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add-user" element={<AddNewUser />} />
              <Route path="/edit-user/:userId" element={<UserManagement />} />
              <Route path="/add-class" element={<AddNewClass />} />
              <Route path="/scheduleimport" element={<ScheduleImport />} />
              <Route path="/viewlist" element={<ViewList />} />
              <Route path="/admin-profile" element={<AdminProfile />} />
              <Route path="/activities" element={<Activities />} />
            </Routes>
          </main>
        </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;