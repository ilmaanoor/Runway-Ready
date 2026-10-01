// SeatingPage.jsx — Pure React Physical Runway Catwalk Canvas & Virtual Access Tiers
import React, { useState } from 'react';
import runwayShowBanner from '../assets/runway_show_banner.png';
import editorPortraitImg from '../assets/fashion_editor_portrait.png';

export default function SeatingPage({ selectedEvent, guests, sections, assignments, onAssignSeat, onUnassignSeat }) {
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [warnings, setWarnings] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  // Handle Seat Assignment using Pure React State Function
  const handleAssign = (guestId, sectionId, position) => {
    if (!guestId || !sectionId) return;

    setWarnings([]);
    setSuccessMessage('');
    setErrorMessage('');

    const res = onAssignSeat(guestId, sectionId, position);
    if (res.success) {
      setSuccessMessage(res.message);
      if (res.warnings && res.warnings.length > 0) {
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
        <span className="section-kicker">SEATING & ACCESS RULE-ENGINE</span>
        <h1 className="page-title">
          {isPhysical ? 'Physical Seating Grid' : 'Virtual Access Tiers'}
        </h1>
        <p className="page-description">
          Event: <strong>{selectedEvent.name}</strong> | Type: <strong>{selectedEvent.type}</strong>
        </p>
      </div>

      {/* Strict Tier Mismatch / Capacity Error Banner */}
      {errorMessage && (
        <div className="seating-error-banner">
          BLOCKED: {errorMessage}
        </div>
      )}

      {/* Rival Brand Clash Warning Banner (Names exact rival attendees & brands) */}
      {warnings.length > 0 && (
        <div className="seating-rival-banner">
          <strong>RIVAL BRAND SEATING CONFLICT DETECTED:</strong>
          <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
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
        /* PHYSICAL RUNWAY VIEW (25% Left Sidebar + 75% Runway Canvas) */
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
                      max="20"
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
                  {/* Show section name only (it already contains the tier) — seats filled / total */}
                  <h4 className="section-block-title">
                    {sec.name} — Seats: {secAssignments.length} / {sec.capacity}
                  </h4>
                  <div className="seat-grid-parallel">
                    {Array.from({ length: sec.capacity }, (_, i) => i + 1).map(pos => {
                      const assigned = secAssignments.find(a => a.position === pos);
                      return (
                        <div 
                          key={pos} 
                          className={`seat-square-block ${assigned ? 'occupied' : ''}`}
                          style={{ cursor: 'pointer' }}
                          title={assigned ? 'Click to unassign seat' : 'Click to assign guest'}
                          onClick={() => {
                            if (assigned) {
                              onUnassignSeat(assigned.guestId);
                            } else {
                              // If a guest is selected in sidebar, assign that guest
                              // Otherwise, find the next unassigned guest matching this section's tier
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
                          <span className="seat-num-tag">Seat {pos}</span>
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
        /* VIRTUAL EVENT VIEW (3 Access Column Cards) */
        <div className="virtual-three-columns">
          {sections.map(sec => {
            const secAssignments = assignments.filter(a => a.sectionId === sec.id);
            const capacityPct = Math.round((secAssignments.length / sec.capacity) * 100);
            return (
              <div key={sec.id} className="virtual-column-card">
                <h3 className="virtual-column-title">{sec.name}</h3>
                <span className="sidebar-title">Capacity: {secAssignments.length} / {sec.capacity}</span>
                
                <div className="capacity-meter-bar">
                  <div className="capacity-meter-fill" style={{ width: `${Math.min(capacityPct, 100)}%` }}></div>
                </div>

                <div className="virtual-guest-list">
                  {secAssignments.length === 0 ? (
                    <p style={{ color: '#7d7d7d', fontSize: '0.85rem' }}>No passes issued.</p>
                  ) : (
                    secAssignments.map(a => (
                      <div key={a.id} className="virtual-guest-row">
                        <div>
                          <div className="guest-name-bold">{a.guestName}</div>
                          <div className="guest-brand-uppercase">{a.guestBrand || 'INDEPENDENT'}</div>
                        </div>
                        <button 
                          className="btn-delete-minimal" 
                          onClick={() => onUnassignSeat(a.guestId)}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
