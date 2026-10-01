// Navbar.jsx — Pure React Navigation & Event Switcher (2-Tier Roles)
import React from 'react';

export default function Navbar({ currentUser, activePage, setActivePage, eventsList, selectedEvent, setSelectedEvent, onLogout }) {
  if (!currentUser) return null;

  return (
    <header className="main-navbar">
      <div className="navbar-container">
        {/* Left Section: Brand Logo */}
        <div className="navbar-brand" onClick={() => setActivePage('dashboard')}>
          <div className="brand-logo">RR</div>
          <div className="brand-text">
            <span className="brand-title">RUNWAY READY</span>
            <span className="brand-subtitle">SEATING SYSTEM</span>
          </div>
        </div>

        {/* Center Section: Navigation Tabs */}
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
          
          {currentUser.role === 'admin' && (
            <button 
              className={`nav-tab ${activePage === 'report' ? 'active' : ''}`}
              onClick={() => setActivePage('report')}
            >
              Event Report
            </button>
          )}

          {currentUser.role === 'admin' && (
            <button 
              className={`nav-tab ${activePage === 'admin' ? 'active' : ''}`}
              onClick={() => setActivePage('admin')}
            >
              Admin
            </button>
          )}
        </nav>

        {/* Right Section: Active Event Selector & User Sign Out Group */}
        <div className="navbar-right-group">
          <div className="navbar-event-selector">
            <label className="event-select-label">SHOW:</label>
            <select 
              className="event-select-dropdown"
              value={selectedEvent ? selectedEvent.id : ''}
              onChange={(e) => {
                const ev = eventsList.find(item => item.id === parseInt(e.target.value));
                if (ev) setSelectedEvent(ev);
              }}
            >
              {eventsList.length === 0 ? (
                <option value="">No Events</option>
              ) : (
                eventsList.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.type.toUpperCase()}) — {ev.date}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="navbar-user">
            <div className="user-info">
              <span className="user-name">{currentUser.name}</span>
              <span className="user-role">{currentUser.role.toUpperCase()}</span>
            </div>
            <button className="btn-signout" onClick={onLogout}>
              SIGN OUT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
