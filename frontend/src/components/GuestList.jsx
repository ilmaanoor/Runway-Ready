// GuestList.jsx — Pure React Guest Management (CRUD: Create, Read, Update, Delete)
import React, { useState } from 'react';
import modestCoutureImg from '../assets/modest_couture_brand.png';

export default function GuestList({ selectedEvent, guests, onAddGuest, onDeleteGuest, onToggleCheckin }) {
  const [name, setName] = useState('');
  const [tier, setTier] = useState('VIP');
  const [brand, setBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL');
  const [fadeCheckedIn, setFadeCheckedIn] = useState(false);

  // Handle Form Submission (Create Operation)
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddGuest({
      name: name.trim(),
      tier,
      brand: brand.trim()
    });

    // Reset Form Fields
    setName('');
    setBrand('');
    setTier('VIP');
  };

  if (!selectedEvent) {
    return (
      <div className="page-wrapper">
        <div className="warning-overlay-banner">
          Please select an event from the top navigation bar or Dashboard to view guests.
        </div>
      </div>
    );
  }

  // Filter Guests based on Search and Tier (Read Operation)
  const filteredGuests = guests.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (g.brand && g.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTier = selectedTierFilter === 'ALL' || g.tier.toUpperCase() === selectedTierFilter;
    return matchesSearch && matchesTier;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">GUEST ROSTER MANAGEMENT</span>
        <h1 className="page-title">Invited Guest List</h1>
        <p className="page-description">Show: <strong>{selectedEvent.name}</strong> ({selectedEvent.type})</p>
      </div>

      <div className="dashboard-layout">
        {/* Left Column: Form + Vertical Framed Fashion Image Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>Add New Guest</h3>
              <p>Enter guest credentials and access tier</p>
            </div>

            <form onSubmit={handleFormSubmit} className="form-stack">
              <div className="form-group-editorial">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="input-editorial" 
                  placeholder="e.g. Anna Wintour" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-editorial">
                <label>Access Tier</label>
                <select 
                  className="input-editorial" 
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                >
                  <option value="VIP">VIP</option>
                  <option value="Press">Press</option>
                  <option value="Buyer">Buyer</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group-editorial">
                <label>Brand / House</label>
                <input 
                  type="text" 
                  className="input-editorial" 
                  placeholder="e.g. Chanel, Vogue, Dior, Gucci" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-couture btn-primary-couture">
                + Add to Roster
              </button>
            </form>
          </div>

          {/* Small Vertical Editorial Image Card */}
          <div className="editorial-frame-card">
            <img src={modestCoutureImg} alt="Couture Brand Identity" className="sidebar-editorial-img vertical" />
          </div>
        </div>

        {/* Right Side Table: Attendee Directory (Read, Update, Delete) */}
        <div className="card-editorial">
          <div className="card-header-couture" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3>Attendee Directory ({filteredGuests.length})</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Opacity Fade Toggle */}
              <label style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={fadeCheckedIn} 
                  onChange={(e) => setFadeCheckedIn(e.target.checked)} 
                />
                Fade Checked-In
              </label>

              {/* Search Filter Input */}
              <input 
                type="text" 
                className="input-editorial" 
                style={{ maxWidth: '200px' }}
                placeholder="Search name or brand..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredGuests.length === 0 ? (
            <p style={{ color: '#7d7d7d', fontSize: '0.9rem', marginTop: '16px' }}>No guests match your criteria.</p>
          ) : (
            <div className="table-editorial-wrapper">
              <table className="table-editorial">
                <thead>
                  <tr>
                    <th>Attendee & Brand</th>
                    <th>Access Tier</th>
                    <th>Gate Check-In</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map(g => (
                    <tr 
                      key={g.id} 
                      style={{ 
                        opacity: fadeCheckedIn && g.checked_in ? 0.35 : 1,
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      <td>
                        <span className="guest-name-bold">{g.name}</span>
                        <span className="guest-brand-uppercase">{g.brand ? g.brand.toUpperCase() : 'INDEPENDENT'}</span>
                      </td>
                      <td>
                        <span className={`tier-pill-minimal ${g.tier.toLowerCase()}`}>
                          {g.tier}
                        </span>
                      </td>
                      <td>
                        {/* Check-In Toggle Button (Update Operation) */}
                        <button 
                          className={g.checked_in ? 'btn-checkin-green' : 'btn-checkin-pending'}
                          onClick={() => onToggleCheckin(g.id)}
                        >
                          {g.checked_in ? '✓ Checked In' : 'Pending Check-In'}
                        </button>
                      </td>
                      <td>
                        {/* Delete Guest Button (Delete Operation) */}
                        <button 
                          className="btn-delete-minimal" 
                          onClick={() => onDeleteGuest(g.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
