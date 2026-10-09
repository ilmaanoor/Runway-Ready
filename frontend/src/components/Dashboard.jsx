// Dashboard.jsx — Pure React Event Dashboard with Form Handling (<90 lines)
import React, { useState } from 'react';
import fashionCollageImg from '../assets/fashion_week_collage.png';
import illustrationImg from '../assets/couture_illustration.png';
import typographyImg from '../assets/fashion_typography.jpg';

export default function Dashboard({ currentUser, events, onAddEvent, onDeleteEvent, onSelectEvent, activeSelectedEvent }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Physical');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !date) return;
    const validCapacity = Math.max(1, parseInt(capacity) || 100);
    onAddEvent({
      name, date, type, 
      location: location.trim() || (type === 'Virtual' ? 'https://zoom.us/test' : 'Grand Palais, Paris'),
      capacity: validCapacity,
      description: description || 'Runway Showcase'
    });
    setName(''); setDate(''); setLocation(''); setDescription(''); setCapacity('100');
    setMsg(`Event "${name}" created successfully!`);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">SHOW DIRECTORY</span>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Manage fashion shows, seating rosters, and virtual access</p>
      </div>

      {msg && <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', color: '#065f46', padding: '10px 14px', marginBottom: '14px', fontWeight: 'bold' }}>✓ {msg}</div>}

      <div className="dashboard-gallery-row">
        <div className="editorial-frame-card"><img src={fashionCollageImg} alt="Trends" className="editorial-thumbnail" /></div>
        <div className="editorial-frame-card"><img src={illustrationImg} alt="Sketches" className="editorial-thumbnail" /></div>
        <div className="editorial-frame-card"><img src={typographyImg} alt="Design" className="editorial-thumbnail" /></div>
      </div>

      <div className="dashboard-layout" style={{ marginTop: '24px' }}>
        {currentUser?.role === 'admin' ? (
          <div className="card-editorial">
            <div className="card-header-couture"><h3>Create New Event</h3><p>Set up physical runway or virtual stream</p></div>
            <form onSubmit={handleSubmit} className="form-stack">
              <div className="form-group-editorial"><label>Event Name</label><input type="text" className="input-editorial" placeholder="e.g. Milan Gala 2027" value={name} onChange={e => setName(e.target.value)} required /></div>
              <div className="form-group-editorial"><label>Event Date</label><input type="date" min={today} className="input-editorial" value={date} onChange={e => setDate(e.target.value)} required /></div>
              <div className="form-group-editorial"><label>Format</label><select className="input-editorial" value={type} onChange={e => setType(e.target.value)}><option value="Physical">Physical (Runway)</option><option value="Virtual">Virtual (Zoom Stream)</option></select></div>
              <div className="form-group-editorial"><label>{type === 'Virtual' ? 'Livestream Link' : 'Venue Location'}</label><input type="text" className="input-editorial" placeholder={type === 'Virtual' ? 'https://zoom.us/test' : 'Grand Palais, Paris'} value={location} onChange={e => setLocation(e.target.value)} /></div>
              <div className="form-group-editorial"><label>Max Capacity</label><input type="number" min="1" className="input-editorial" value={capacity} onChange={e => setCapacity(e.target.value.replace(/[^0-9]/g, ''))} required /></div>
              <div className="form-group-editorial"><label>Theme / Description</label><input type="text" className="input-editorial" placeholder="e.g. Haute Couture Showcase" value={description} onChange={e => setDescription(e.target.value)} /></div>
              <button type="submit" className="btn-couture btn-primary-couture">+ Create Event</button>
            </form>
          </div>
        ) : (
          <div className="card-editorial">
            <div className="card-header-couture"><span className="tier-pill-minimal vip">COORDINATOR</span><h3>Show Operations</h3><p>Welcome, {currentUser?.name}! Select an event on the right to manage guests and seating.</p></div>
          </div>
        )}

        <div className="card-editorial">
          <div className="card-header-couture"><h3>Active Events ({events.length})</h3><p>Select an event to open seating</p></div>
          {events.length === 0 ? <p style={{ color: '#777' }}>No events found.</p> : (
            <div className="events-grid-couture">
              {events.map(ev => {
                const isSelected = activeSelectedEvent?.id === ev.id;
                return (
                  <div key={ev.id} className={`event-card-couture ${isSelected ? 'selected-event' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className={`tier-pill-minimal ${ev.type === 'Physical' ? 'vip' : 'general'}`}>{ev.type}</span><span style={{ fontSize: '0.8rem', color: '#777' }}>{ev.date}</span></div>
                    <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.15rem', margin: '8px 0' }}>{ev.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#555' }}>📍 {ev.location || 'Paris'} | 👥 {ev.capacity} Guests</p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button className={`btn-couture ${isSelected ? 'btn-primary-couture' : 'btn-secondary-couture'}`} style={{ flex: 1 }} onClick={() => onSelectEvent(ev)}>{isSelected ? 'Selected' : 'Select'}</button>
                      <button className="btn-delete-minimal" onClick={() => { if (window.confirm(`Delete "${ev.name}"?`)) onDeleteEvent(ev.id); }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
