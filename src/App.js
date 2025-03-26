import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link, Routes, Navigate } from 'react-router-dom';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <button className="hamburger-menu" onClick={toggleMenu}>
            ☰
          </button>
        </header>

        <main className="app-content">
          <Routes>
            {/* Add this redirect route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Existing routes */}
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