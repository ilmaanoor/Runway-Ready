// Admin.jsx — Pure React Team & Seating Protocol Management (<90 lines)
import React, { useState } from 'react';
import adminRunwayBanner from '../assets/admin_runway_editorial.png';

export default function Admin({ users = [], separationRules = [], onAddUser, onDeleteUser, onAddSeparationRule, onDeleteSeparationRule }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('coordinator');
  const [brandA, setBrandA] = useState('');
  const [brandB, setBrandB] = useState('');
  const [msg, setMsg] = useState('');

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    onAddUser({ name, email, password, role });
    setName(''); setEmail(''); setPassword('');
    setMsg(`User "${name}" added!`);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleRuleSubmit = (e) => {
    e.preventDefault();
    if (!brandA || !brandB) return;
    onAddSeparationRule({ brandA, brandB });
    setBrandA(''); setBrandB('');
    setMsg(`Separation rule set for "${brandA}" & "${brandB}"!`);
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">SYSTEM CONTROL</span>
        <h1 className="page-title">Admin Console</h1>
        <p className="page-description">Manage staff accounts and brand separation protocols</p>
      </div>

      {msg && <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', color: '#065f46', padding: '10px', marginBottom: '14px', fontWeight: 'bold' }}>✓ {msg}</div>}

      <div className="editorial-frame-card banner-fashion" style={{ marginBottom: '20px' }}>
        <img src={adminRunwayBanner} alt="Runway" className="admin-banner-img" />
      </div>

      <div className="admin-grid-layout">
        {/* Team Members Card */}
        <div className="card-editorial">
          <div className="card-header-couture"><h3>Team Members ({users.length})</h3><p>Manage event coordinator access</p></div>
          <form onSubmit={handleUserSubmit} className="form-stack" style={{ marginBottom: '16px' }}>
            <div className="form-group-editorial"><label>Name</label><input type="text" className="input-editorial" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="form-group-editorial"><label>Email</label><input type="email" className="input-editorial" value={email} onChange={e => setEmail(e.target.value)} required /></div>
            <div className="form-group-editorial"><label>Password</label><input type="password" className="input-editorial" value={password} onChange={e => setPassword(e.target.value)} required /></div>
            <div className="form-group-editorial"><label>Role</label><select className="input-editorial" value={role} onChange={e => setRole(e.target.value)}><option value="coordinator">Coordinator</option><option value="admin">Admin</option></select></div>
            <button type="submit" className="btn-couture btn-primary-couture">+ Add Member</button>
          </form>
          <table className="table-editorial">
            <thead><tr><th>Name & Email</th><th>Role</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong><br/><small style={{ color: '#777' }}>{u.email}</small></td>
                  <td><span className={`tier-pill-minimal ${u.role === 'admin' ? 'vip' : 'press'}`}>{u.role}</span></td>
                  <td>{u.role !== 'admin' && <button className="btn-delete-minimal" onClick={() => onDeleteUser(u.id)}>Remove</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Brand Separation Card */}
        <div className="card-editorial">
          <div className="card-header-couture"><h3>Brand Separation Protocol</h3><p>Define competing houses that cannot sit adjacent</p></div>
          <form onSubmit={handleRuleSubmit} className="form-stack" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group-editorial"><label>Brand A</label><input type="text" className="input-editorial" placeholder="e.g. Chanel" value={brandA} onChange={e => setBrandA(e.target.value)} required /></div>
              <div className="form-group-editorial"><label>Brand B</label><input type="text" className="input-editorial" placeholder="e.g. Dior" value={brandB} onChange={e => setBrandB(e.target.value)} required /></div>
            </div>
            <button type="submit" className="btn-couture btn-primary-couture">+ Add Rule</button>
          </form>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {separationRules.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid #eaeaea', borderRadius: '4px' }}>
                <span><strong>{r.brandA || r.brand_a}</strong> separated from <strong>{r.brandB || r.brand_b}</strong></span>
                <button className="btn-delete-minimal" onClick={() => onDeleteSeparationRule(r.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
