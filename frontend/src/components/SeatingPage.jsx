import React, { useState, useEffect } from 'react';
import runwayShowBanner from '../assets/runway_show_banner.png';
import editorPortraitImg from '../assets/fashion_editor_portrait.png';

export default function SeatingPage({ selectedEvent }) {
  const [guests, setGuests] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [warnings, setWarnings] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (!selectedEvent) return;
    setLoading(true);

    Promise.all([
      fetch(`http://127.0.0.1:5000/api/guests?event_id=${selectedEvent.id}`).then(res => res.json()),
      fetch(`http://127.0.0.1:5000/api/sections?event_id=${selectedEvent.id}`).then(res => res.json()),
      fetch(`http://127.0.0.1:5000/api/seat_assignments?event_id=${selectedEvent.id}`).then(res => res.json())
    ])
      .then(([guestData, sectionData, assignmentData]) => {
        setGuests(guestData);
        setSections(sectionData);
        setAssignments(assignmentData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [selectedEvent]);

  const handleAssign = (guestId, sectionId, position) => {
    if (!guestId || !sectionId) return;

    setWarnings([]);
    setSuccessMessage('');
    setErrorMessage('');

    fetch('http://127.0.0.1:5000/api/assign_seat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guest_id: parseInt(guestId),
        section_id: parseInt(sectionId),
        position: parseInt(position)
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuccessMessage(data.message || 'Guest assigned successfully.');
          if (data.warnings && data.warnings.length > 0) {
            setWarnings(data.warnings);
          }
          loadData();
        } else if (data.error) {
          // Show the specific error message from backend (tier mismatch, capacity, etc.)
          setErrorMessage(data.error);
        }
      })
      .catch(err => {
        setErrorMessage('Network error: Could not connect to backend.');
        console.error(err);
      });
  };

  const handleUnassign = (guestId) => {
    fetch(`http://127.0.0.1:5000/api/unassign_seat/${guestId}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => loadData())
      .catch(err => console.error(err));
  };

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
  const unassignedGuests = guests.filter(g => !assignments.some(a => a.guest_id === g.id));

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

      {/* Strict Error Banner (Tier Mismatch / Capacity Full) */}
      {errorMessage && (
        <div className="seating-error-banner">
          BLOCKED: {errorMessage}
        </div>
      )}

      {/* Rival Brand Clash Warning Banner — shows exact names */}
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

      {successMessage && !warnings.length && !errorMessage && (
        <div style={{ background: '#f0fdf4', borderLeft: '4px solid #10b981', color: '#065f46', padding: '12px 16px', marginBottom: '16px', fontSize: '0.88rem', fontWeight: '600', borderRadius: '0 4px 4px 0' }}>
          ✓ {successMessage}
        </div>
      )}

      {isPhysical ? (
        /* PHYSICAL EVENT VIEW (25% LEFT SIDEBAR + 75% MAIN RUNWAY CANVAS) */
        <div className="seating-split-layout">
          {/* Left Sidebar (25% Width): Unassigned Guest Pool */}
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
                    onClick={() => { setSelectedGuestId(g.id); setSelectedSectionId(''); setErrorMessage(''); setWarnings([]); }}
                  >
                    <div className="guest-name-bold">{g.name}</div>
                    <div className="guest-brand-uppercase">
                      {g.brand ? g.brand.toUpperCase() : 'INDEPENDENT'} • <span className={`tier-pill-minimal ${g.tier.toLowerCase()}`}>{g.tier}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedGuestId && (() => {
              const selectedGuest = guests.find(g => g.id === selectedGuestId);
              // Only show sections matching the guest's tier
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

            {/* Small Framed Portrait Card in Left Sidebar */}
            <div className="editorial-frame-card" style={{ marginTop: '24px' }}>
              <img src={editorPortraitImg} alt="New York Fashion Week Editor" className="sidebar-editorial-img" />
              <div className="editorial-card-info" style={{ marginTop: '6px' }}>
                <span className="sidebar-title" style={{ fontSize: '0.7rem' }}>FRONT ROW REGISTRY</span>
                <p style={{ fontSize: '0.75rem' }}>VIP Guest Protocol & Seating</p>
              </div>
            </div>
          </div>

          {/* Main Canvas (75% Width): Runway Layout */}
          <div className="runway-main-canvas">
            {/* Wide Runway Show Banner Format */}
            <div className="runway-banner-container">
              <img src={runwayShowBanner} alt="Runway Catwalk Show" className="runway-banner-img" />
              <div className="runway-banner-overlay-text">RUNWAY CATWALK SHOWCASE</div>
            </div>

            {/* Center Black Runway Rectangle */}
            <div className="runway-stage-center">
              R U N W A Y
            </div>

            {/* Parallel Seat Blocks Grouped by Section */}
            {sections.map(sec => {
              const secAssignments = assignments.filter(a => a.section_id === sec.id);
              return (
                <div key={sec.id} className="seat-row-block">
                  <h4 className="section-block-title">
                    Section: {sec.name} ({sec.allowed_tier}) — Capacity: {secAssignments.length} / {sec.capacity}
                  </h4>
                  <div className="seat-grid-parallel">
                    {Array.from({ length: sec.capacity }, (_, i) => i + 1).map(pos => {
                      const assigned = secAssignments.find(a => a.position === pos);
                      const hasClash = warnings.some(w => w.type === 'brand_clash');
                      return (
                        <div 
                          key={pos} 
                          className={`seat-square-block ${assigned ? 'occupied' : ''} ${assigned && hasClash ? 'has-clash' : ''}`}
                          style={{ cursor: 'pointer' }}
                          title={assigned ? 'Click to unassign seat' : 'Click to assign guest to this seat'}
                          onClick={() => {
                            if (assigned) {
                              handleUnassign(assigned.guest_id);
                            } else {
                              const guestToAssign = selectedGuestId || (unassignedGuests[0] ? unassignedGuests[0].id : null);
                              if (guestToAssign) {
                                handleAssign(guestToAssign, sec.id, pos);
                                setSelectedGuestId(null);
                              } else {
                                alert('No unassigned guests available. Please add guests in the Guest List tab first!');
                              }
                            }
                          }}
                        >
                          <span className="seat-num-tag">Seat {pos}</span>
                          {assigned ? (
                            <div>
                              <div className="seat-guest-name-text">{assigned.guest_name}</div>
                              <div className="seat-guest-brand-text">{assigned.guest_brand || 'No Brand'}</div>
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
        /* VIRTUAL EVENT VIEW (3 COLUMNS) */
        <div className="virtual-three-columns">
          {sections.map(sec => {
            const secAssignments = assignments.filter(a => a.section_id === sec.id);
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
                          <div className="guest-name-bold">{a.guest_name}</div>
                          <div className="guest-brand-uppercase">{a.guest_brand || 'INDEPENDENT'}</div>
                        </div>
                        <button 
                          className="btn-delete-minimal" 
                          onClick={() => handleUnassign(a.guest_id)}
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
