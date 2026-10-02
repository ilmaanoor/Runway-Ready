// SeatingPage.jsx — Pure React Physical Runway Catwalk Canvas & Virtual Access Tiers
import React, { useState } from 'react';
import runwayShowBanner from '../assets/runway_show_banner.png';
import editorPortraitImg from '../assets/fashion_editor_portrait.png';
import adminRunwayBanner from '../assets/admin_runway_editorial.png';

export default function SeatingPage({ selectedEvent, guests, sections, assignments, separationRules = [], onAssignSeat, onUnassignSeat }) {
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [warnings, setWarnings] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showStreamModal, setShowStreamModal] = useState(false);

  if (!selectedEvent) {
    return (
      <div className="page-wrapper">
        <div className="warning-overlay-banner">
          Please select an event from the Dashboard first.
        </div>
      </div>
    );
  }

  const isPhysical = selectedEvent.type === 'Physical';
  const unassignedGuests = guests.filter(g => !assignments.some(a => a.guestId === g.id));

  // Helper: Get a properly formatted, valid stream URL
  const getStreamUrl = (loc) => {
    if (!loc) return 'https://live.chanel.com/runway-broadcast';
    if (loc.startsWith('http://') || loc.startsWith('https://')) return loc;
    if (loc.includes('.')) return `https://${loc}`;
    return `https://live.runway.com/${encodeURIComponent(loc.toLowerCase().replace(/\s+/g, '-'))}`;
  };

  const streamUrl = getStreamUrl(selectedEvent.location);

  // Helper: Detect if an assigned seat has an adjacent brand separation conflict (Physical only)
  const isSeatInConflict = (sectionId, position, assignedGuestBrand) => {
    if (!isPhysical || !assignedGuestBrand || !separationRules || separationRules.length === 0) return false;
    const brandLower = assignedGuestBrand.trim().toLowerCase();

    const adjacent = assignments.filter(a =>
      a.sectionId === sectionId &&
      (a.position === position - 1 || a.position === position + 1)
    );

    return adjacent.some(adj => {
      if (!adj.guestBrand) return false;
      const adjBrandLower = adj.guestBrand.trim().toLowerCase();
      return separationRules.some(r =>
        (r.brandA.toLowerCase() === brandLower && r.brandB.toLowerCase() === adjBrandLower) ||
        (r.brandB.toLowerCase() === brandLower && r.brandA.toLowerCase() === adjBrandLower)
      );
    });
  };

  // Handle Seat / Pass Assignment using Pure React State Function
  const handleAssign = (guestId, sectionId, position) => {
    if (!guestId || !sectionId) return;

    setWarnings([]);
    setSuccessMessage('');
    setErrorMessage('');

    const res = onAssignSeat(guestId, sectionId, position);
    if (res.success) {
      setSuccessMessage(res.message);
      if (res.warnings && res.warnings.length > 0 && isPhysical) {
        setWarnings(res.warnings);
      }
      setSelectedGuestId(null);
    } else {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">
          {isPhysical ? 'SEATING & ACCESS RULE-ENGINE' : 'DIGITAL LIVESTREAM & ACCESS ROSTER'}
        </span>
        <h1 className="page-title">
          {isPhysical ? 'Physical Seating Grid' : 'Virtual Access Tiers & Passes'}
        </h1>
        <p className="page-description">
          Event: <strong>{selectedEvent.name}</strong> | Format: <strong>{selectedEvent.type}</strong>
        </p>
      </div>

      {/* Strict Tier Mismatch / Capacity Error Banner */}
      {errorMessage && (
        <div className="seating-error-banner">
          BLOCKED: {errorMessage}
        </div>
      )}

      {/* Seating Separation Protocol Advisory Banner (Physical only) */}
      {isPhysical && warnings.length > 0 && (
        <div className="seating-rival-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', letterSpacing: '0.5px' }}>
            <span>⚠️</span> SEATING SEPARATION PROTOCOL ADVISORY
          </div>
          <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '0.85rem', lineHeight: '1.5' }}>
            {warnings.map((w, idx) => (
              <li key={idx} style={{ marginTop: '4px' }}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && !warnings.length && !errorMessage && (
        <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', color: '#065f46', padding: '12px 16px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600', borderRadius: '0 4px 4px 0' }}>
          ✓ {successMessage}
        </div>
      )}

      {isPhysical ? (
        /* ================= PHYSICAL RUNWAY CATWALK VIEW ================= */
        <div className="seating-split-layout">
          {/* Left Sidebar: Unassigned Guest Pool */}
          <div className="unassigned-sidebar">
            <h3 className="sidebar-title">Unassigned Guests ({unassignedGuests.length})</h3>
            <div className="unassigned-guest-list">
              {unassignedGuests.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: '#7d7d7d' }}>All guests are seated!</p>
              ) : (
                unassignedGuests.map(g => (
                  <div 
                    key={g.id} 
                    className={`unassigned-guest-item ${selectedGuestId === g.id ? 'selected' : ''}`}
                    onClick={() => { 
                      setSelectedGuestId(g.id); 
                      setSelectedSectionId(''); 
                      setErrorMessage(''); 
                      setWarnings([]); 
                    }}
                  >
                    <div className="guest-name-bold">{g.name}</div>
                    <div className="guest-brand-uppercase">
                      {g.brand ? g.brand.toUpperCase() : 'INDEPENDENT'} • <span className={`tier-pill-minimal ${g.tier.toLowerCase()}`}>{g.tier}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Sidebar Assignment Form */}
            {selectedGuestId && (() => {
              const selectedGuest = guests.find(g => g.id === selectedGuestId);
              const allowedSections = sections.filter(s => s.allowed_tier === (selectedGuest ? selectedGuest.tier : ''));
              return (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #eaeaea' }}>
                  <span className="sidebar-title">Assign Selected Guest</span>
                  {selectedGuest && (
                    <p style={{ fontSize: '0.78rem', color: '#555', marginTop: '6px', marginBottom: '4px' }}>
                      Only <strong>{selectedGuest.tier}</strong> sections are shown for this guest.
                    </p>
                  )}
                  <div className="form-group-editorial" style={{ marginTop: '8px' }}>
                    <label>Section ({selectedGuest ? selectedGuest.tier : ''} only)</label>
                    <select 
                      className="input-editorial" 
                      value={selectedSectionId}
                      onChange={e => setSelectedSectionId(e.target.value)}
                    >
                      <option value="">-- Choose Section --</option>
                      {allowedSections.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group-editorial">
                    <label>Seat #</label>
                    <input 
                      type="number" 
                      className="input-editorial" 
                      value={selectedPosition} 
                      onChange={e => setSelectedPosition(e.target.value)}
                      min="1"
                      max="100"
                    />
                  </div>
                  <button 
                    className="btn-couture btn-primary-couture" 
                    style={{ width: '100%' }}
                    onClick={() => handleAssign(selectedGuestId, selectedSectionId, selectedPosition)}
                  >
                    Assign Seat
                  </button>
                </div>
              );
            })()}

            {/* Small Portrait Card in Sidebar */}
            <div className="editorial-frame-card" style={{ marginTop: '24px' }}>
              <img src={editorPortraitImg} alt="Fashion Editor Portrait" className="sidebar-editorial-img" />
            </div>
          </div>

          {/* Main Runway Catwalk Canvas */}
          <div className="runway-main-canvas">
            {/* Wide Banner */}
            <div className="runway-banner-container">
              <img src={runwayShowBanner} alt="Runway Show Banner" className="runway-banner-img" />
              <div className="runway-banner-overlay-text">RUNWAY CATWALK SHOWCASE</div>
            </div>

            {/* Center Runway Strip */}
            <div className="runway-stage-center">
              R U N W A Y
            </div>

            {/* Parallel Seat Blocks Grouped by Section */}
            {sections.map(sec => {
              const secAssignments = assignments.filter(a => a.sectionId === sec.id);
              return (
                <div key={sec.id} className="seat-row-block">
                  <h4 className="section-block-title">
                    {sec.name} — Seats: {secAssignments.length} / {sec.capacity}
                  </h4>
                  <div className="seat-grid-parallel">
                    {Array.from({ length: sec.capacity }, (_, i) => i + 1).map(pos => {
                      const assigned = secAssignments.find(a => a.position === pos);
                      const isConflict = assigned && isSeatInConflict(sec.id, pos, assigned.guestBrand);

                      return (
                        <div 
                          key={pos} 
                          className={`seat-square-block ${assigned ? 'occupied' : ''} ${isConflict ? 'has-conflict' : ''}`}
                          style={{ cursor: 'pointer' }}
                          title={
                            isConflict 
                              ? '⚠️ Brand Separation Conflict! Click to unassign seat' 
                              : (assigned ? 'Click to unassign seat' : 'Click to assign guest')
                          }
                          onClick={() => {
                            if (assigned) {
                              onUnassignSeat(assigned.guestId);
                            } else {
                              const matchingUnassigned = unassignedGuests.filter(g => g.tier === sec.allowed_tier);
                              const guestToAssign = selectedGuestId || (matchingUnassigned[0] ? matchingUnassigned[0].id : null);
                              
                              if (guestToAssign) {
                                handleAssign(guestToAssign, sec.id, pos);
                              } else {
                                alert(`No unassigned ${sec.allowed_tier} guests available! Please add ${sec.allowed_tier} guests in the Guest List tab first.`);
                              }
                            }
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="seat-num-tag">Seat {pos}</span>
                            {isConflict && <span className="seat-conflict-indicator">⚠️ CONFLICT</span>}
                          </div>
                          {assigned ? (
                            <div>
                              <div className="seat-guest-name-text">{assigned.guestName}</div>
                              <div className="seat-guest-brand-text">{assigned.guestBrand || 'INDEPENDENT'}</div>
                            </div>
                          ) : (
                            <span style={{ color: '#000', fontWeight: 'bold', fontSize: '0.75rem' }}>+ Vacant</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= VIRTUAL DIGITAL ACCESS TIERS VIEW ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top Live Broadcast Stream Information Card */}
          <div className="virtual-stream-banner-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="live-stream-badge">🔴 LIVE BROADCAST STREAM</span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginTop: '6px' }}>
                  {selectedEvent.name} — Digital Portal
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#ccc', marginTop: '4px' }}>
                  Secure Stream URL: <strong style={{ color: '#38bdf8' }}>{streamUrl}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  className="btn-couture btn-primary-couture"
                  style={{ background: '#ffffff', color: '#000000', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => setShowStreamModal(true)}
                >
                  ▶ Open Live Stream Player
                </button>
              </div>
            </div>
          </div>

          {/* Live Virtual Broadcast Player Modal */}
          {showStreamModal && (
            <div className="stream-modal-overlay" onClick={() => setShowStreamModal(false)}>
              <div className="stream-modal-content" onClick={e => e.stopPropagation()}>
                <div className="stream-modal-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="live-stream-badge">🔴 4K ULTRA HD BROADCAST</span>
                    <strong style={{ color: '#ffffff', fontSize: '1rem' }}>{selectedEvent.name}</strong>
                  </div>
                  <button 
                    className="stream-modal-close" 
                    onClick={() => setShowStreamModal(false)}
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="stream-video-container">
                  <img 
                    src={adminRunwayBanner} 
                    alt="Live Catwalk Stream" 
                    className="stream-video-preview" 
                  />
                  <div className="stream-live-overlay-tag">
                    <span className="live-pulse-dot"></span> LIVE CATWALK FEED • 1,420 VIEWERS
                  </div>
                  <div className="stream-video-controls">
                    <span>▶ Playing • 1080p 60fps</span>
                    <span>🔊 Audio Active • Dolby Atmos</span>
                  </div>
                </div>

                <div className="stream-modal-footer">
                  <div style={{ fontSize: '0.8rem', color: '#aaa' }}>
                    Stream Portal Link: <span style={{ color: '#38bdf8' }}>{streamUrl}</span>
                  </div>
                  <a 
                    href={streamUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-couture btn-secondary-couture"
                    style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#222', color: '#fff' }}
                  >
                    Open in External Tab ↗
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Virtual Pass Management Split Layout */}
          <div className="seating-split-layout">
            
            {/* Left Sidebar: Unassigned Guest Pool to Issue Passes */}
            <div className="unassigned-sidebar">
              <h3 className="sidebar-title">Pending Pass Requests ({unassignedGuests.length})</h3>
              <p style={{ fontSize: '0.75rem', color: '#777', marginBottom: '12px' }}>
                Select an attendee to issue their digital livestream pass:
              </p>

              <div className="unassigned-guest-list">
                {unassignedGuests.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: '#7d7d7d' }}>All guests hold active digital passes!</p>
                ) : (
                  unassignedGuests.map(g => {
                    const matchingSec = sections.find(s => s.allowed_tier === g.tier);
                    const secAssignments = matchingSec ? assignments.filter(a => a.sectionId === matchingSec.id) : [];
                    const nextPos = secAssignments.length + 1;

                    return (
                      <div 
                        key={g.id} 
                        className="unassigned-guest-item"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <div>
                          <div className="guest-name-bold">{g.name}</div>
                          <div className="guest-brand-uppercase">
                            {g.brand ? g.brand.toUpperCase() : 'INDEPENDENT'} • <span className={`tier-pill-minimal ${g.tier.toLowerCase()}`}>{g.tier}</span>
                          </div>
                        </div>

                        <button 
                          className="btn-couture btn-secondary-couture"
                          style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                          onClick={() => {
                            if (matchingSec) {
                              handleAssign(g.id, matchingSec.id, nextPos);
                            }
                          }}
                        >
                          + Issue Pass
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Canvas: 4 Digital Access Tier Cards */}
            <div style={{ flex: 1 }}>
              <div className="virtual-four-grid">
                {sections.map(sec => {
                  const secAssignments = assignments.filter(a => a.sectionId === sec.id);
                  const capacityPct = Math.round((secAssignments.length / sec.capacity) * 100);
                  const matchingUnassigned = unassignedGuests.filter(g => g.tier === sec.allowed_tier);

                  return (
                    <div key={sec.id} className="virtual-column-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className={`tier-pill-minimal ${sec.allowed_tier.toLowerCase()}`}>
                          {sec.allowed_tier.toUpperCase()} TIER
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#444' }}>
                          {secAssignments.length} / {sec.capacity} Passes
                        </span>
                      </div>

                      <h3 className="virtual-column-title">{sec.name}</h3>
                      
                      {/* Live Progress Bar — Neutral Luxury Black for all tiers */}
                      <div className="capacity-meter-bar">
                        <div 
                          className="capacity-meter-fill" 
                          style={{ 
                            width: `${Math.min(capacityPct, 100)}%`,
                            background: '#111111'
                          }}
                        ></div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#777' }}>
                          Utilization: <strong>{capacityPct}%</strong>
                        </span>

                        {matchingUnassigned.length > 0 && (
                          <button
                            className="btn-couture btn-primary-couture"
                            style={{ fontSize: '0.68rem', padding: '3px 8px' }}
                            onClick={() => {
                              handleAssign(matchingUnassigned[0].id, sec.id, secAssignments.length + 1);
                            }}
                          >
                            + Issue Next Pass
                          </button>
                        )}
                      </div>

                      {/* Issued Pass Holders Roster */}
                      <div className="virtual-guest-list">
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#999', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                          Active Pass Holders ({secAssignments.length})
                        </div>

                        {secAssignments.length === 0 ? (
                          <p style={{ color: '#999', fontSize: '0.8rem', fontStyle: 'italic', padding: '8px 0' }}>
                            No digital passes issued yet.
                          </p>
                        ) : (
                          secAssignments.map(a => (
                            <div key={a.id} className="virtual-guest-row">
                              <div>
                                <div className="guest-name-bold">{a.guestName}</div>
                                <div className="guest-brand-uppercase" style={{ fontSize: '0.68rem', color: '#666' }}>
                                  {a.guestBrand || 'INDEPENDENT'} • <span style={{ color: '#059669', fontWeight: '700' }}>PASS #{a.id.toString().slice(-4)}</span>
                                </div>
                              </div>
                              <button 
                                className="btn-delete-minimal" 
                                title="Revoke Pass"
                                onClick={() => onUnassignSeat(a.guestId)}
                              >
                                Revoke
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
