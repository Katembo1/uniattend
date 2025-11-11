import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/sidebar'; // Import the Sidebar component
import Login from './components/Login';
import AddBeacon from './components/add_beacon';
import AddVenue from './components/add_venue';
import Dashboard from './components/dashboard';
import Reports from './components/reports';
import Scheduling from './components/scheduling';
import Security from './components/security';
import Settings from './components/settings';
import Users from './components/users';
import Venues from './components/venues';
import AddNewUser from './components/newuser';
import AddNewClass from './components/AddNewClass';
import ScheduleImport from './components/importschedule';
import ViewList from './components/viewlist';
import AdminProfile from "./components/AdminProfile";
import NotificationContainer from './components/NotificationContainer';
import './App.css';

function AppContent() {
  const { addNotification } = useApp();
  
  useEffect(() => {
    document.title = 'Tech High';
    
    // Expose notification function globally for API interceptor
    window.showNotification = addNotification;
    
    return () => {
      document.title = 'Tech High';
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
              <Route path="/add-class" element={<AddNewClass />} />
              <Route path="/scheduleimport" element={<ScheduleImport />} />
              <Route path="/viewlist" element={<ViewList />} />
              <Route path="/admin-profile" element={<AdminProfile />} />
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