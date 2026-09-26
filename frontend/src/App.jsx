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
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('login');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedEvent(null);
    setActivePage('login');
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setActivePage('seating'); // Default to seating page when an event is selected
  };

  return (
    <div className="app-root">
      <Navbar 
        currentUser={currentUser} 
        activePage={activePage} 
        setActivePage={setActivePage}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {!currentUser ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
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
