import React, { useState, useEffect } from 'react';
import fashionCollageImg from '../assets/fashion_week_collage.png';
import illustrationImg from '../assets/couture_illustration.png';
import typographyImg from '../assets/fashion_typography.jpg';

export default function Dashboard({ onSelectEvent, activeSelectedEvent }) {
  const [events, setEvents] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Physical');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEvents = () => {
    setLoading(true);
    fetch('http://127.0.0.1:5000/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch events from backend.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!name || !date) return;

    fetch('http://127.0.0.1:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, date, type, location, capacity, description })
    })
      .then(res => res.json())
      .then(() => {
        setName('');
        setDate('');
        setType('Physical');
        setLocation('');
        setCapacity('100');
        setDescription('');
        fetchEvents();
      })
      .catch(err => setError('Could not create event.'));
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">SHOW DIRECTORY</span>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Oversee fashion show events, seating rosters, and virtual access tiers</p>
      </div>

      {error && <div className="warning-overlay-banner capacity">{error}</div>}

      {/* Editorial Fashion Gallery Row */}
      <div className="dashboard-gallery-row">
        <div className="editorial-frame-card">
          <img src={fashionCollageImg} alt="Fashion Week Trends" className="editorial-thumbnail" />
          <div className="editorial-card-info">
            <span className="sidebar-title">FASHION WEEK 2026</span>
            <p>Modern runway trends & seating rosters</p>
          </div>
        </div>

        <div className="editorial-frame-card">
          <img src={illustrationImg} alt="Couture Sketches" className="editorial-thumbnail" />
          <div className="editorial-card-info">
            <span className="sidebar-title">HAUTE COUTURE ILLUST</span>
            <p>Rival brand clash matrix rules</p>
          </div>
        </div>

        <div className="editorial-frame-card">
          <img src={typographyImg} alt="Typography & Design" className="editorial-thumbnail" />
          <div className="editorial-card-info">
            <span className="sidebar-title">COUTURE TYPOGRAPHY</span>
            <p>High-fashion editorial layout design</p>
          </div>
        </div>
      </div>

      <div className="dashboard-layout" style={{ marginTop: '28px' }}>
        {/* Create Event */}
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

        {/* List Events */}
        <div className="card-editorial">
          <div className="card-header-couture">
            <h3>Active Events ({events.length})</h3>
            <p>Select an event to configure seating or access tiers</p>
          </div>

          {loading ? (
            <p>Loading events...</p>
          ) : events.length === 0 ? (
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
                        📍 <strong>Location:</strong> {ev.location}
                      </p>
                    )}

                    {ev.capacity && (
                      <p style={{ fontSize: '0.8rem', color: '#555', marginBottom: '4px' }}>
                        👥 <strong>Capacity:</strong> {ev.capacity} Guests
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
