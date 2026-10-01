// Dashboard.jsx — Pure React Event Dashboard & Form Handling
import React, { useState } from 'react';
import fashionCollageImg from '../assets/fashion_week_collage.png';
import illustrationImg from '../assets/couture_illustration.png';
import typographyImg from '../assets/fashion_typography.jpg';

export default function Dashboard({ currentUser, events, onAddEvent, onSelectEvent, activeSelectedEvent }) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Physical');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Form Submission using Pure React State
  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!name || !date) return;

    onAddEvent({
      name,
      date,
      type,
      location: location || (type === 'Physical' ? 'Runway Arena' : 'Livestream Portal'),
      capacity: parseInt(capacity) || 100,
      description: description || 'Exclusive Runway Showcase'
    });

    // Reset Form Fields
    setName('');
    setDate('');
    setType('Physical');
    setLocation('');
    setCapacity('100');
    setDescription('');
    setSuccessMessage(`Event "${name}" created successfully!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">SHOW DIRECTORY</span>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Oversee fashion show events, seating rosters, and virtual access tiers</p>
      </div>

      {successMessage && (
        <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', color: '#065f46', padding: '12px 16px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600', borderRadius: '0 4px 4px 0' }}>
          ✓ {successMessage}
        </div>
      )}

      {/* Editorial Fashion Gallery Row */}
      <div className="dashboard-gallery-row">
        <div className="editorial-frame-card">
          <img src={fashionCollageImg} alt="Fashion Week Trends" className="editorial-thumbnail" />
        </div>

        <div className="editorial-frame-card">
          <img src={illustrationImg} alt="Couture Sketches" className="editorial-thumbnail" />
        </div>

        <div className="editorial-frame-card">
          <img src={typographyImg} alt="Typography & Design" className="editorial-thumbnail" />
        </div>
      </div>

      <div className="dashboard-layout" style={{ marginTop: '28px' }}>
        {/* Left Card: Create Event Form for Admin / Workstation Card for Coordinator */}
        {currentUser && currentUser.role === 'admin' ? (
          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>Create New Show Event</h3>
              <p>Set up physical runway seating or virtual stream tiers</p>
            </div>
            
            <form onSubmit={handleCreateEvent} className="form-stack">
              <div className="form-group-editorial">
                <label>Event Name</label>
                <input 
                  type="text" 
                  className="input-editorial" 
                  placeholder="e.g. Autumn Runway Gala 2027" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-editorial">
                <label>Event Date</label>
                <input 
                  type="date" 
                  className="input-editorial" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-editorial">
                <label>Event Format</label>
                <select 
                  className="input-editorial" 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Physical">Physical (Runway Grid)</option>
                  <option value="Virtual">Virtual (Access Tiers)</option>
                </select>
              </div>

              <div className="form-group-editorial">
                <label>Venue Location / Stream Link</label>
                <input 
                  type="text" 
                  className="input-editorial" 
                  placeholder="e.g. Grand Palais, Paris / twitch.tv/fashion" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group-editorial">
                <label>Max Guest Capacity</label>
                <input 
                  type="number" 
                  className="input-editorial" 
                  placeholder="100" 
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>

              <div className="form-group-editorial">
                <label>Event Description / Theme</label>
                <textarea 
                  className="input-editorial" 
                  placeholder="e.g. Spring Haute Couture Runway Showcase" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <button type="submit" className="btn-couture btn-primary-couture">
                + Create Event
              </button>
            </form>
          </div>
        ) : (
          <div className="card-editorial">
            <div className="card-header-couture">
              <span className="tier-pill-minimal vip" style={{ marginBottom: '8px', display: 'inline-block' }}>COORDINATOR WORKSPACE</span>
              <h3>Show Operations & Logistics</h3>
              <p>Welcome, {currentUser ? currentUser.name : 'Coordinator'}! You have active access to Guest Management & Runway Seating.</p>
            </div>
            
            <div style={{ marginTop: '16px', lineHeight: '1.6', fontSize: '0.88rem', color: '#444' }}>
              <p><strong>Your Operational Responsibilities:</strong></p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li>Register new VIP, Press, Buyer, and General attendees.</li>
                <li>Perform live gate check-ins as guests arrive at the venue.</li>
                <li>Assign seats on the physical runway catwalk canvas.</li>
                <li>Monitor automated rule-engine conflict warnings.</li>
              </ul>
              <div style={{ marginTop: '20px', padding: '12px', background: '#f9f9fb', borderLeft: '3px solid #000' }}>
                👉 Select any active event on the right to manage its guest list and seating arrangement.
              </div>
            </div>
          </div>
        )}

        {/* Right Card: List Events */}
        <div className="card-editorial">
          <div className="card-header-couture">
            <h3>Active Events ({events.length})</h3>
            <p>Select an event to configure seating or access tiers</p>
          </div>

          {events.length === 0 ? (
            <p style={{ color: '#7d7d7d' }}>No events scheduled.</p>
          ) : (
            <div className="events-grid-couture">
              {events.map(ev => {
                const isSelected = activeSelectedEvent && activeSelectedEvent.id === ev.id;
                return (
                  <div key={ev.id} className={`event-card-couture ${isSelected ? 'selected-event' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className={`tier-pill-minimal ${ev.type === 'Physical' ? 'vip' : 'general'}`}>
                        {ev.type.toUpperCase()}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#7d7d7d' }}>{ev.date}</span>
                    </div>

                    <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', marginBottom: '8px' }}>{ev.name}</h4>

                    {ev.location && (
                      <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '4px' }}>
                        <strong>Location:</strong> {ev.location}
                      </p>
                    )}

                    {ev.capacity && (
                      <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '4px' }}>
                        <strong>Capacity:</strong> {ev.capacity} Guests
                      </p>
                    )}

                    {ev.description && (
                      <p style={{ fontSize: '0.8rem', color: '#777', marginBottom: '12px', fontStyle: 'italic' }}>
                        "{ev.description}"
                      </p>
                    )}

                    <button 
                      className={`btn-couture ${isSelected ? 'btn-primary-couture' : 'btn-secondary-couture'}`}
                      style={{ width: '100%', fontSize: '0.75rem', marginTop: '8px' }}
                      onClick={() => onSelectEvent(ev)}
                    >
                      {isSelected ? 'Currently Selected' : 'Select Event'}
                    </button>
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
