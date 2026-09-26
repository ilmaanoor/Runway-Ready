// RUNWAY READY — Main Application Root Component
// Built for Stella Maris College BCA - Functional Web Development Syllabus (Unit 3 & Unit 4)
// Concepts Used: Functional Components, useState, Props, and Conditional Rendering (No Router)

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GuestList from './components/GuestList';
import SeatingPage from './components/SeatingPage';
import Admin from './components/Admin';
import EventReport from './components/EventReport';
import './App.css';

export default function App() {
  // 1. STATE MANAGEMENT (useState Hook)
  // Stores the currently logged-in user details (null if logged out)
  const [currentUser, setCurrentUser] = useState(null);

  // Stores which page to render ('login', 'dashboard', 'guests', 'seating', 'admin', 'report')
  const [activePage, setActivePage] = useState('login');

  // Stores the currently selected show event object
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 2. EVENT HANDLER FUNCTIONS
  // Called when user successfully logs in
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  // Called when user clicks "Sign Out"
  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedEvent(null);
    setActivePage('login');
  };

  // Called when user selects an event from Dashboard
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setActivePage('seating'); // Navigate to Seating Page for the selected event
  };

  // 3. JSX RENDER (Conditional rendering switches pages without extra router libraries)
  return (
    <div className="app-root">
      {/* Top Navigation Bar Component */}
      <Navbar 
        currentUser={currentUser} 
        activePage={activePage} 
        setActivePage={setActivePage}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {!currentUser ? (
          /* Render Login Page if user is not logged in */
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          /* Render Active Page based on state */
          <>
            {activePage === 'dashboard' && (
              <Dashboard 
                onSelectEvent={handleSelectEvent} 
                activeSelectedEvent={selectedEvent} 
              />
            )}
            {activePage === 'guests' && (
              <GuestList selectedEvent={selectedEvent} />
            )}
            {activePage === 'seating' && (
              <SeatingPage selectedEvent={selectedEvent} />
            )}
            {activePage === 'admin' && (
              <Admin selectedEvent={selectedEvent} />
            )}
            {activePage === 'report' && (
              <EventReport selectedEvent={selectedEvent} />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Runway Ready © 2027 — Fashion Show Seating & Access Coordination System</p>
      </footer>
    </div>
  );
}
