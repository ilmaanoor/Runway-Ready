import React, { useState, useEffect } from 'react';
import maleModelImg from '../assets/male_model_editorial.png';

export default function Admin({ selectedEvent }) {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('pr_team');

  const [rivals, setRivals] = useState([]);
  const [brandA, setBrandA] = useState('');
  const [brandB, setBrandB] = useState('');

  const [sections, setSections] = useState([]);
  const [secName, setSecName] = useState('');
  const [secTier, setSecTier] = useState('VIP');
  const [secCap, setSecCap] = useState(10);

  const [message, setMessage] = useState('');

  const fetchUsers = () => {
    fetch('http://127.0.0.1:5000/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  const fetchRivals = () => {
    fetch('http://127.0.0.1:5000/api/rival_brands')
      .then(res => res.json())
      .then(data => setRivals(data));
  };

  const fetchSections = () => {
    if (!selectedEvent) return;
    fetch(`http://127.0.0.1:5000/api/sections?event_id=${selectedEvent.id}`)
      .then(res => res.json())
      .then(data => setSections(data));
  };

  useEffect(() => {
    fetchUsers();
    fetchRivals();
    if (selectedEvent) fetchSections();
  }, [selectedEvent]);

  const handleAddUser = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:5000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName, email: userEmail, password: userPassword, role: userRole })
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) setMessage(data.error);
        else {
          setUserName(''); setUserEmail(''); setUserPassword('');
          fetchUsers();
        }
      });
  };

  const handleDeleteUser = (id) => {
    fetch(`http://127.0.0.1:5000/api/users/${id}`, { method: 'DELETE' })
      .then(() => fetchUsers());
  };

  const handleAddRival = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:5000/api/rival_brands', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand_a: brandA, brand_b: brandB })
    })
      .then(res => res.json())
      .then(() => {
        setBrandA(''); setBrandB('');
        fetchRivals();
      });
  };

  const handleDeleteRival = (id) => {
    fetch(`http://127.0.0.1:5000/api/rival_brands/${id}`, { method: 'DELETE' })
      .then(() => fetchRivals());
  };

  const handleAddSection = (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    fetch('http://127.0.0.1:5000/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: selectedEvent.id,
        name: secName,
        allowed_tier: secTier,
        capacity: parseInt(secCap)
      })
    })
      .then(res => res.json())
      .then(() => {
        setSecName('');
        fetchSections();
      });
  };

  const handleDeleteSection = (id) => {
    fetch(`http://127.0.0.1:5000/api/sections/${id}`, { method: 'DELETE' })
      .then(() => fetchSections());
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">SYSTEM CONTROL</span>
        <h1 className="page-title">Admin Console</h1>
        <p className="page-description">Manage team members, rival brand pairs, and section capacity limits</p>
      </div>

      {message && <div className="warning-overlay-banner capacity">{message}</div>}

      {/* SECTION 1: Team Members */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
          1. Team Members & Roles
        </h2>
        <div className="dashboard-layout">
          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>Add Team Member</h3>
            </div>
            <form onSubmit={handleAddUser} className="form-stack">
              <div className="form-group-editorial">
                <label>Full Name</label>
                <input type="text" className="input-editorial" value={userName} onChange={e => setUserName(e.target.value)} required />
              </div>
              <div className="form-group-editorial">
                <label>Email Address</label>
                <input type="email" className="input-editorial" value={userEmail} onChange={e => setUserEmail(e.target.value)} required />
              </div>
              <div className="form-group-editorial">
                <label>Password</label>
                <input type="password" className="input-editorial" value={userPassword} onChange={e => setUserPassword(e.target.value)} required />
              </div>
              <div className="form-group-editorial">
                <label>Role</label>
                <select className="input-editorial" value={userRole} onChange={e => setUserRole(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="pr_team">PR Team</option>
                  <option value="venue_team">Venue Team</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <button type="submit" className="btn-couture btn-primary-couture">+ Add Member</button>
            </form>
          </div>

          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>Team Roster ({users.length})</h3>
            </div>
            <table className="table-editorial">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className="tier-pill-minimal vip">{u.role.toUpperCase()}</span></td>
                    <td>
                      <button className="btn-delete-minimal" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 2: Rival Brands */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
          2. Rival Brand Clash Rules
        </h2>
        <div className="dashboard-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-editorial">
              <div className="card-header-couture">
                <h3>Define Rival Brand Pair</h3>
              </div>
              <form onSubmit={handleAddRival} className="form-stack">
                <div className="form-group-editorial">
                  <label>Brand A</label>
                  <input type="text" className="input-editorial" placeholder="e.g. Chanel" value={brandA} onChange={e => setBrandA(e.target.value)} required />
                </div>
                <div className="form-group-editorial">
                  <label>Brand B (Rival)</label>
                  <input type="text" className="input-editorial" placeholder="e.g. Dior" value={brandB} onChange={e => setBrandB(e.target.value)} required />
                </div>
                <button type="submit" className="btn-couture btn-primary-couture">+ Add Pair</button>
              </form>
            </div>

            {/* Small Editorial Image Card */}
            <div className="editorial-frame-card">
              <img src={maleModelImg} alt="Brand Identity & Male Editorial" className="sidebar-editorial-img" style={{ height: '160px' }} />
              <div className="editorial-card-info">
                <span className="sidebar-title">BRAND CONFLICT MATRIX</span>
                <p>Prevent rival brand clashes in adjacent seats</p>
              </div>
            </div>
          </div>

          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>Configured Rival Pairs ({rivals.length})</h3>
            </div>
            <table className="table-editorial">
              <thead>
                <tr>
                  <th>Brand A</th>
                  <th>Status</th>
                  <th>Brand B</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rivals.map(r => (
                  <tr key={r.id}>
                    <td><strong>{r.brand_a.toUpperCase()}</strong></td>
                    <td><span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 'bold' }}>RIVAL</span></td>
                    <td><strong>{r.brand_b.toUpperCase()}</strong></td>
                    <td>
                      <button className="btn-delete-minimal" onClick={() => handleDeleteRival(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 3: Section Capacity Limits */}
      {selectedEvent && (
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
            3. Section Capacity Limits ({selectedEvent.name})
          </h2>
          <div className="dashboard-layout">
            <div className="card-editorial">
              <div className="card-header-couture">
                <h3>Add Section Limit</h3>
              </div>
              <form onSubmit={handleAddSection} className="form-stack">
                <div className="form-group-editorial">
                  <label>Section Name</label>
                  <input type="text" className="input-editorial" placeholder="e.g. Front Row Runway" value={secName} onChange={e => setSecName(e.target.value)} required />
                </div>
                <div className="form-group-editorial">
                  <label>Allowed Tier</label>
                  <select className="input-editorial" value={secTier} onChange={e => setSecTier(e.target.value)}>
                    <option value="VIP">VIP</option>
                    <option value="Press">Press</option>
                    <option value="Buyer">Buyer</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div className="form-group-editorial">
                  <label>Max Capacity</label>
                  <input type="number" className="input-editorial" value={secCap} onChange={e => setSecCap(e.target.value)} required min="1" />
                </div>
                <button type="submit" className="btn-couture btn-primary-couture">+ Add Section</button>
              </form>
            </div>

            <div className="card-editorial">
              <div className="card-header-couture">
                <h3>Sections ({sections.length})</h3>
              </div>
              <table className="table-editorial">
                <thead>
                  <tr>
                    <th>Section Name</th>
                    <th>Allowed Tier</th>
                    <th>Capacity Limit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map(s => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="tier-pill-minimal vip">{s.allowed_tier}</span></td>
                      <td>{s.capacity} seats</td>
                      <td>
                        <button className="btn-delete-minimal" onClick={() => handleDeleteSection(s.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
