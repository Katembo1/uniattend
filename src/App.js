import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/sidebar'; // Import the Sidebar component
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
import './App.css';

function App() {
  useEffect(() => {
    document.title = 'Tech High ';
    return () => {
      document.title = 'Tech High';
    };
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div className={`App ${isMenuOpen ? 'menu-open' : ''}`}> {/* Add a class for styling */}
        <header className="app-header">
          <button className="hamburger-menu" onClick={toggleMenu}>
            ☰
            <Sidebar/>
          </button>
        </header>

        {isMenuOpen || <Sidebar toggleMenu={toggleMenu} />} {/* Conditionally render the Sidebar */}

        <main className="app-content">
          <Routes>
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
    </Router>
  );
}

export default App;