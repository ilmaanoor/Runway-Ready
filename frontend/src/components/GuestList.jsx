import React, { useState, useEffect } from 'react';

export default function GuestList({ selectedEvent }) {
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState('');
  const [tier, setTier] = useState('VIP');
  const [brand, setBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGuests = () => {
    if (!selectedEvent) return;
    setLoading(true);
    fetch(`http://127.0.0.1:5000/api/guests?event_id=${selectedEvent.id}`)
      .then(res => res.json())
      .then(data => {
        setGuests(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch guests.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGuests();
  }, [selectedEvent]);

  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!name || !selectedEvent) return;

    fetch('http://127.0.0.1:5000/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: selectedEvent.id,
        name,
        tier,
        brand
      })
    })
      .then(res => res.json())
      .then(() => {
        setName('');
        setBrand('');
        setTier('VIP');
        fetchGuests();
      })
      .catch(err => setError('Could not add guest.'));
  };

  const handleDeleteGuest = (id) => {
    fetch(`http://127.0.0.1:5000/api/guests/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => fetchGuests())
      .catch(err => setError('Could not delete guest.'));
  };

  const handleToggleCheckin = (guest) => {
    const newStatus = guest.checked_in ? 0 : 1;
    fetch(`http://127.0.0.1:5000/api/guests/${guest.id}/checkin`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked_in: newStatus })
    })
      .then(res => res.json())
      .then(() => fetchGuests())
      .catch(err => setError('Could not update check-in status.'));
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

      {error && <div className="warning-overlay-banner capacity">{error}</div>}

      <div className="dashboard-layout">
        {/* Left Side Add Form */}
        <div className="card-editorial">
          <div className="card-header-couture">
            <h3>Add New Guest</h3>
            <p>Enter guest credentials and tier</p>
          </div>

          <form onSubmit={handleAddGuest} className="form-stack">
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
                placeholder="e.g. Chanel, Vogue, Dior" 
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-couture btn-primary-couture">
              + Add to Roster
            </button>
          </form>
        </div>

        {/* Right Side Table */}
        <div className="card-editorial">
          <div className="card-header-couture" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Attendee Directory ({filteredGuests.length})</h3>
            </div>
            <input 
              type="text" 
              className="input-editorial" 
              style={{ maxWidth: '220px' }}
              placeholder="Search name or brand..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <p>Loading guest directory...</p>
          ) : filteredGuests.length === 0 ? (
            <p style={{ color: '#7d7d7d', fontSize: '0.9rem' }}>No guests match your criteria.</p>
          ) : (
            <div className="table-editorial-wrapper">
              <table className="table-editorial">
                <thead>
                  <tr>
                    <th>Attendee & Brand</th>
                    <th>Access Tier</th>
                    <th>Check-In Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map(g => (
                    <tr key={g.id} className={g.checked_in ? 'checked-in-row' : ''}>
                      <td>
                        <span className="guest-name-bold">{g.name}</span>
                        <span className="guest-brand-uppercase">{g.brand ? g.brand.toUpperCase() : 'INDEPENDENT'}</span>
                      </td>
                      <td>
                        {/* Minimal pill badge with no background fill */}
                        <span className={`tier-pill-minimal ${g.tier.toLowerCase()}`}>
                          {g.tier}
                        </span>
                      </td>
                      <td>
                        {/* Minimal Toggle Switch */}
                        <div 
                          className="toggle-switch-container" 
                          onClick={() => handleToggleCheckin(g)}
                        >
                          <div className={`toggle-switch ${g.checked_in ? 'checked' : ''}`}>
                            <div className="toggle-slider"></div>
                          </div>
                          <span className="toggle-label">{g.checked_in ? 'Arrived' : 'Pending'}</span>
                        </div>
                      </td>
                      <td>
                        <button 
                          className="btn-delete-minimal" 
                          onClick={() => handleDeleteGuest(g.id)}
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
