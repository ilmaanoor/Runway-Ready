import React, { useState } from 'react';
import parisFashionWeekImg from '../assets/paris_fashion_week.png';
import fashionIllustrationImg from '../assets/couture_illustration.png';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@runway.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    fetch('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          onLoginSuccess(data.user);
        } else {
          setError(data.message || 'Invalid credentials. Please try again.');
        }
      })
      .catch(err => {
        setLoading(false);
        setError('Cannot connect to backend server. Ensure Flask server is running.');
      });
  };

  return (
    <div className="login-wrapper-split">
      {/* Left Editorial Visual Card */}
      <div className="login-visual-panel">
        <div className="image-frame-editorial">
          <img src={parisFashionWeekImg} alt="Paris Fashion Week 2026" className="login-editorial-img" />
          <div className="image-caption-tag">PARIS FASHION WEEK 2026 • OFFICIAL SEATING PORTAL</div>
        </div>
      </div>

      {/* Right Form Card */}
      <div className="login-card-editorial">
        <div className="login-header">
          <span className="login-badge-couture">FASHION SHOW MANAGEMENT</span>
          <h1 className="login-title">RUNWAY READY</h1>
          <p className="login-subtitle">Guest Seating & Access Coordination System</p>
        </div>

        {error && <div className="warning-overlay-banner capacity" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="form-group-editorial">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input-editorial" 
              placeholder="e.g. admin@runway.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group-editorial">
            <label>Password</label>
            <input 
              type="password" 
              className="input-editorial" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-couture btn-primary-couture" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>
      </div>
    </div>
  );
}
