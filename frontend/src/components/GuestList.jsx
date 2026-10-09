// GuestList.jsx — Pure React Guest Management with CRUD
import React, { useState } from 'react';
import modestCoutureImg from '../assets/modest_couture_brand.png';

export default function GuestList({ selectedEvent, guests, onAddGuest, onDeleteGuest, onToggleCheckin }) {
  const [name, setName] = useState('');
  const [tier, setTier] = useState('VIP');
  const [brand, setBrand] = useState('');
  const [search, setSearch] = useState('');
  const [fadeCheckedIn, setFadeCheckedIn] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddGuest({ name: name.trim(), tier, brand: brand.trim() || 'Independent' });
    setName(''); setBrand(''); setTier('VIP');
  };

  if (!selectedEvent) return <div className="page-wrapper"><div className="warning-overlay-banner">Please select an event from Dashboard first.</div></div>;

  const filtered = guests.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || (g.brand && g.brand.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">GUEST ROSTER</span>
        <h1 className="page-title">Invited Guest List</h1>
        <p className="page-description">Show: <strong>{selectedEvent.name}</strong> ({selectedEvent.type})</p>
      </div>

      <div className="dashboard-layout">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-editorial">
            <div className="card-header-couture"><h3>Add New Guest</h3><p>Register attendee name, tier & brand</p></div>
            <form onSubmit={handleSubmit} className="form-stack">
              <div className="form-group-editorial"><label>Full Name</label><input type="text" className="input-editorial" placeholder="e.g. Anna Wintour" value={name} onChange={e => setName(e.target.value)} required /></div>
              <div className="form-group-editorial"><label>Access Tier</label><select className="input-editorial" value={tier} onChange={e => setTier(e.target.value)}><option value="VIP">VIP</option><option value="Press">Press</option><option value="Buyer">Buyer</option><option value="General">General</option></select></div>
              <div className="form-group-editorial"><label>Brand / House</label><input type="text" className="input-editorial" placeholder="e.g. Chanel, Dior" value={brand} onChange={e => setBrand(e.target.value)} /></div>
              <button type="submit" className="btn-couture btn-primary-couture">+ Add to Roster</button>
            </form>
          </div>
          <div className="editorial-frame-card"><img src={modestCoutureImg} alt="Couture Brand" className="sidebar-editorial-img vertical" /></div>
        </div>

        <div className="card-editorial">
          <div className="card-header-couture" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div><h3>Attendee Directory ({filtered.length})</h3></div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label style={{ fontSize: '0.78rem', cursor: 'pointer' }}><input type="checkbox" checked={fadeCheckedIn} onChange={e => setFadeCheckedIn(e.target.checked)} /> Fade Checked-In</label>
              <input type="text" className="input-editorial" style={{ maxWidth: '180px' }} placeholder="Search name/brand..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? <p style={{ color: '#777', marginTop: '16px' }}>No matching guests found.</p> : (
            <div className="table-editorial-wrapper">
              <table className="table-editorial">
                <thead><tr><th>Attendee & Brand</th><th>Access Tier</th><th>Check-In</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(g => (
                    <tr key={g.id} style={{ opacity: fadeCheckedIn && g.checked_in ? 0.35 : 1 }}>
                      <td><span className="guest-name-bold">{g.name}</span><span className="guest-brand-uppercase">{g.brand ? g.brand.toUpperCase() : 'INDEPENDENT'}</span></td>
                      <td><span className={`tier-pill-minimal ${g.tier.toLowerCase()}`}>{g.tier}</span></td>
                      <td><button className={g.checked_in ? 'btn-checkin-green' : 'btn-checkin-pending'} onClick={() => onToggleCheckin(g.id)}>{g.checked_in ? '✓ Checked In' : 'Pending Check-In'}</button></td>
                      <td><button className="btn-delete-minimal" onClick={() => onDeleteGuest(g.id)}>Remove</button></td>
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
