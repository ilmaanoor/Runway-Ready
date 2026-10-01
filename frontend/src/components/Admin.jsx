// Admin.jsx — Pure React Admin Console (Team Management & Seating Separation Protocol)
import React, { useState } from 'react';
import maleModelImg from '../assets/male_model_editorial.png';

export default function Admin({ selectedEvent, users, separationRules, sections, onAddUser, onDeleteUser, onAddSeparationRule, onDeleteSeparationRule }) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState('coordinator');

  const [brandA, setBrandA] = useState('');
  const [brandB, setBrandB] = useState('');
  const [message, setMessage] = useState('');

  // Form Submit: Add New Team Member
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim() || !userPassword.trim()) return;

    // Check for duplicate email
    if (users.some(u => u.email.toLowerCase() === userEmail.trim().toLowerCase())) {
      setMessage('Error: A team member with this email already exists.');
      return;
    }

    onAddUser({
      name: userName.trim(),
      email: userEmail.trim(),
      password: userPassword.trim(),
      role: userRole
    });

    setUserName('');
    setUserEmail('');
    setUserPassword('');
    setMessage(`Team member "${userName}" added successfully!`);
    setTimeout(() => setMessage(''), 4000);
  };

  // Form Submit: Add New Seating Separation Rule
  const handleSeparationSubmit = (e) => {
    e.preventDefault();
    if (!brandA.trim() || !brandB.trim()) return;

    onAddSeparationRule(brandA.trim(), brandB.trim());

    setBrandA('');
    setBrandB('');
    setMessage(`Separation protocol set: "${brandA}" and "${brandB}" will be flagged if seated adjacent.`);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">SYSTEM CONTROL</span>
        <h1 className="page-title">Admin Console</h1>
        <p className="page-description">Manage team members, seating separation protocol, and section capacity</p>
      </div>

      {message && (
        <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', color: '#065f46', padding: '12px 16px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600', borderRadius: '0 4px 4px 0' }}>
          ✓ {message}
        </div>
      )}

      {/* Editorial Fashion Portrait Banner — image only, no subtitle text */}
      <div className="editorial-frame-card banner-fashion" style={{ marginBottom: '28px' }}>
        <img src={maleModelImg} alt="Admin Console" className="admin-banner-img" />
      </div>

      <div className="admin-grid-layout">

        {/* 1. Team Members Management Card */}
        <div className="card-editorial">
          <div className="card-header-couture">
            <h3>Team Members ({users.length})</h3>
            <p>Add staff accounts for event coordinators</p>
          </div>

          <form onSubmit={handleUserSubmit} className="form-stack" style={{ marginBottom: '20px' }}>
            <div className="form-group-editorial">
              <label>Full Name</label>
              <input
                type="text"
                className="input-editorial"
                placeholder="e.g. Sophia Chen"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="form-group-editorial">
              <label>Email Address</label>
              <input
                type="email"
                className="input-editorial"
                placeholder="e.g. sophia@runway.com"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group-editorial">
              <label>Password</label>
              <input
                type="password"
                className="input-editorial"
                placeholder="••••••••"
                value={userPassword}
                onChange={e => setUserPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group-editorial">
              <label>Assigned Role</label>
              <select
                className="input-editorial"
                value={userRole}
                onChange={e => setUserRole(e.target.value)}
              >
                <option value="coordinator">Event Coordinator (Guest List &amp; Seating Floor)</option>
                <option value="admin">Admin (Full System Access)</option>
              </select>
            </div>

            <button type="submit" className="btn-couture btn-primary-couture">
              + Add Member
            </button>
          </form>

          {/* Team Members List */}
          <div className="table-editorial-wrapper">
            <table className="table-editorial">
              <thead>
                <tr>
                  <th>Name &amp; Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <span className="guest-name-bold">{u.name}</span>
                      <span style={{ fontSize: '0.75rem', color: '#777', display: 'block' }}>{u.email}</span>
                    </td>
                    <td>
                      <span className={`tier-pill-minimal ${u.role === 'admin' ? 'vip' : 'press'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className="btn-delete-minimal"
                          onClick={() => onDeleteUser(u.id)}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Seating Separation Protocol Card */}
        <div className="card-editorial">
          <div className="card-header-couture">
            <h3>Seating Separation Protocol</h3>
            <p>Define brand pairs that should not be seated adjacent to each other during the event</p>
          </div>

          <form onSubmit={handleSeparationSubmit} className="form-stack" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group-editorial">
                <label>Brand A</label>
                <input
                  type="text"
                  className="input-editorial"
                  placeholder="e.g. Chanel"
                  value={brandA}
                  onChange={e => setBrandA(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-editorial">
                <label>Brand B</label>
                <input
                  type="text"
                  className="input-editorial"
                  placeholder="e.g. Dior"
                  value={brandB}
                  onChange={e => setBrandB(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-couture btn-primary-couture">
              + Add Separation Rule
            </button>
          </form>

          {/* Active Separation Rules List */}
          <div style={{ marginTop: '16px' }}>
            <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
              Active Separation Rules ({separationRules.length})
            </h4>

            {separationRules.length === 0 ? (
              <p style={{ color: '#7d7d7d', fontSize: '0.85rem' }}>No separation rules defined.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {separationRules.map(r => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      border: '1px solid #eaeaea',
                      borderRadius: '4px',
                      background: '#ffffff'
                    }}
                  >
                    <div>
                      <strong style={{ letterSpacing: '0.5px' }}>{r.brandA.toUpperCase()}</strong>
                      <span style={{ color: '#64748b', margin: '0 10px', fontWeight: '400', fontSize: '0.82rem' }}>
                        separated from
                      </span>
                      <strong style={{ letterSpacing: '0.5px' }}>{r.brandB.toUpperCase()}</strong>
                    </div>
                    <button
                      className="btn-delete-minimal"
                      onClick={() => onDeleteSeparationRule(r.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
