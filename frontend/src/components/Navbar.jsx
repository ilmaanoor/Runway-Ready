import React, { useState, useEffect } from 'react';

export default function Navbar({ currentUser, activePage, setActivePage, selectedEvent, setSelectedEvent, onLogout }) {
  const [eventsList, setEventsList] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetch('http://127.0.0.1:5000/api/events')
        .then(res => res.json())
        .then(data => {
          setEventsList(data);
          if (!selectedEvent && data.length > 0) {
            setSelectedEvent(data[0]);
          }
        })
        .catch(err => console.error(err));
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <header className="main-navbar">
      <div className="navbar-container">
        {/* Brand Title */}
        <div className="navbar-brand" onClick={() => setActivePage('dashboard')}>
          <div className="brand-logo">RR</div>
          <div className="brand-text">
            <span className="brand-title">RUNWAY READY</span>
            <span className="brand-subtitle">SEATING & ACCESS SYSTEM</span>
          </div>
        </div>

        {/* Global Event Selector */}
        <div className="navbar-event-selector">
          <label className="event-select-label">ACTIVE EVENT:</label>
          <select 
            className="event-select-dropdown"
            value={selectedEvent ? selectedEvent.id : ''}
            onChange={(e) => {
              const ev = eventsList.find(item => item.id === parseInt(e.target.value));
              if (ev) setSelectedEvent(ev);
            }}
          >
            {eventsList.length === 0 ? (
              <option value="">No Events Available</option>
            ) : (
              eventsList.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({ev.type.toUpperCase()}) — {ev.date}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Navigation Tabs without emojis */}
        <nav className="navbar-links">
          <button 
            className={`nav-tab ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            Dashboard
          </button>
          
          <button 
            className={`nav-tab ${activePage === 'guests' ? 'active' : ''}`}
            onClick={() => setActivePage('guests')}
          >
            Guest List
          </button>
          
          <button 
            className={`nav-tab ${activePage === 'seating' ? 'active' : ''}`}
            onClick={() => setActivePage('seating')}
          >
            Seating Page
          </button>
          
          <button 
            className={`nav-tab ${activePage === 'report' ? 'active' : ''}`}
            onClick={() => setActivePage('report')}
          >
            Event Report
          </button>

          {currentUser.role === 'admin' && (
            <button 
              className={`nav-tab ${activePage === 'admin' ? 'active' : ''}`}
              onClick={() => setActivePage('admin')}
            >
              Admin
            </button>
          )}
        </nav>

        {/* User Profile */}
        <div className="navbar-user">
          <div className="user-info">
            <span className="user-name">{currentUser.name}</span>
            <span className="user-role-badge">{currentUser.role.replace('_', ' ').toUpperCase()}</span>
          </div>
          <button className="btn-logout" onClick={onLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
