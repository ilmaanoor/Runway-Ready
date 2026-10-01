// Login.jsx — Pure React Authentication Form
import React, { useState } from 'react';
import portraitCoutureImg from '../assets/couture_illustration.png';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@runway.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = onLogin(email, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="login-wrapper-split">
      {/* Left Vertical Portrait Image Frame */}
      <div className="login-visual-panel">
        <div className="image-frame-editorial portrait">
          <img src={portraitCoutureImg} alt="Paris Haute Couture Portrait" className="login-editorial-img portrait" />
          <div className="image-caption-tag">PARIS HAUTE COUTURE • OFFICIAL SEATING PORTAL</div>
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

          <button type="submit" className="btn-couture btn-primary-couture" style={{ width: '100%', marginTop: '8px' }}>
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
}
