// SeatingPage.jsx — Pure React Physical Runway Catwalk Canvas & Virtual Access Tiers
import React, { useState } from 'react';
import runwayShowBanner from '../assets/runway_show_banner.png';
import editorPortraitImg from '../assets/fashion_editor_portrait.png';

export default function SeatingPage({ selectedEvent, guests, sections, assignments, separationRules = [], onAssignSeat, onUnassignSeat, onUpdateSectionCapacity }) {
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [warnings, setWarnings] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedGuestId, setCopiedGuestId] = useState(null);

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
  const unassignedGuests = guests.filter(g => !assignments.some(a => Number(a.guestId || a.guest_id) === Number(g.id)));

  // Dynamic Credential Extractor from user's URL
  const extractZoomDetails = (rawLoc) => {
    const defaultUrl = 'https://zoom.us/test';
    const defaultId = '842 9173 0245';
    const defaultPass = 'RUNWAY2027';

    if (!rawLoc || !rawLoc.trim()) {
      return { url: defaultUrl, meetingId: defaultId, passcode: defaultPass };
    }

    const trimmed = rawLoc.trim();
    let finalUrl = trimmed;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      finalUrl = `https://${trimmed}`;
    }

    // Try extracting meeting ID (numbers sequence of 9-11 digits)
    const idMatch = finalUrl.match(/\/j(?:oin)?\/(\d+)/i) || finalUrl.match(/(\d{9,11})/);
    let extractedId = defaultId;
    if (idMatch && idMatch[1]) {
      const rawNum = idMatch[1];
      if (rawNum.length === 10) {
        extractedId = `${rawNum.slice(0, 3)} ${rawNum.slice(3, 6)} ${rawNum.slice(6)}`;
      } else if (rawNum.length === 11) {
        extractedId = `${rawNum.slice(0, 3)} ${rawNum.slice(3, 7)} ${rawNum.slice(7)}`;
      } else {
        extractedId = rawNum;
      }
    }

    // Try extracting passcode from pwd= query parameter
    const pwdMatch = finalUrl.match(/[?&]pwd=([^&#]+)/i);
    let extractedPass = defaultPass;
    if (pwdMatch && pwdMatch[1]) {
      extractedPass = decodeURIComponent(pwdMatch[1]);
    } else if (finalUrl.includes('zoom.us/test')) {
      extractedPass = 'RUNWAY2027';
      extractedId = '842 9173 0245';
    }

    return { url: finalUrl, meetingId: extractedId, passcode: extractedPass };
  };

  const streamDetails = extractZoomDetails(selectedEvent.location);
  const streamUrl = streamDetails.url;

  // Helper: Detect if an assigned seat has an adjacent brand separation conflict (Physical only)
  const isSeatInConflict = (sectionId, position, assignedGuestBrand) => {
    if (!isPhysical || !assignedGuestBrand || !separationRules || separationRules.length === 0) return false;
    const brandLower = assignedGuestBrand.trim().toLowerCase();

    const adjacent = assignments.filter(a =>
      Number(a.sectionId || a.section_id) === Number(sectionId) &&
      (Number(a.position) === Number(position) - 1 || Number(a.position) === Number(position) + 1)
    );

    return adjacent.some(adj => {
      const b = adj.guestBrand || adj.guest_brand;
      if (!b) return false;
      const adjBrandLower = b.trim().toLowerCase();
      return separationRules.some(r =>
        (r.brandA.toLowerCase() === brandLower && r.brandB.toLowerCase() === adjBrandLower) ||
        (r.brandB.toLowerCase() === brandLower && r.brandA.toLowerCase() === adjBrandLower)
      );
    });
  };

  // Handle Seat / Pass Assignment using Pure React State Function
  const handleAssign = (guestId, sectionId, position) => {
    if (!guestId || !sectionId) {
      setErrorMessage('No matching section found for this guest tier. Please check sections are loaded.');
      return;
    }

    setWarnings([]);
    setSuccessMessage('');
    setErrorMessage('');

    const res = onAssignSeat(guestId, sectionId, position);
    if (!res) {
      setErrorMessage('Assignment failed — please ensure the backend is running.');
      return;
    }
    if (res.success) {
      setSuccessMessage(res.message);
      if (res.warnings && res.warnings.length > 0 && isPhysical) {
        setWarnings(res.warnings);
      }
      setSelectedGuestId(null);
    } else {
      setErrorMessage(res.error || 'Assignment failed.');
    }
  };

  // Helper: Copy Guest Access Pass & Zoom Link (dynamically uses extracted credentials)
  const handleCopyGuestInvite = (guestId, guestName, guestBrand, tierName, passId) => {
    const inviteText = `🌟 OFFICIAL RUNWAY ACCESS PASS — DIGITAL WEBINAR\nEvent: ${selectedEvent.name}\nGuest: ${guestName} (${guestBrand || 'Independent'})\nAccess Tier: ${tierName}\nPass Code: #RR-${passId.toString().slice(-4)}\n\n🎥 Direct Join Link: ${streamDetails.url}\n🔑 Meeting ID: ${streamDetails.meetingId}\n🔒 Passcode: ${streamDetails.passcode}\nStatus: Verified Access Granted`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteText);
      setCopiedGuestId(guestId);
      setTimeout(() => setCopiedGuestId(null), 2500);
    } else {
      alert(`Invite Pass for ${guestName}:\n\n${inviteText}`);
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
              const selectedGuest = guests.find(g => Number(g.id) === Number(selectedGuestId));
              const guestTierUpper = selectedGuest ? (selectedGuest.tier || '').toUpperCase() : '';
              const allowedSections = sections.filter(s => 
                (s.allowed_tier || '').toUpperCase() === guestTierUpper || 
                (s.allowed_tier || '').toUpperCase() === 'GENERAL'
              );
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
              const secAssignments = assignments.filter(a => Number(a.sectionId || a.section_id) === Number(sec.id));
              const tierGuestCount = guests.filter(g => g.tier && g.tier.toUpperCase() === (sec.allowed_tier || '').toUpperCase()).length;
              const effectiveCapacity = Math.max(sec.capacity, tierGuestCount);
              return (
                <div key={sec.id} className="seat-row-block">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 className="section-block-title" style={{ margin: 0 }}>
                      {sec.name} — Seats: {secAssignments.length} / {effectiveCapacity}
                      {tierGuestCount > sec.capacity && (
                        <span style={{ fontSize: '0.72rem', color: '#2563eb', marginLeft: '8px', fontWeight: 'normal' }}>
                          (auto-expanded for {tierGuestCount} guests)
                        </span>
                      )}
                    </h4>
                    {onUpdateSectionCapacity && (
                      <button
                        onClick={() => onUpdateSectionCapacity(sec.id, effectiveCapacity + 1)}
                        style={{ fontSize: '0.72rem', padding: '3px 8px', border: '1px solid #d0d0d0', background: '#fff', cursor: 'pointer', borderRadius: '3px' }}
                        title="Add one extra seat"
                      >
                        + Add Seat
                      </button>
                    )}
                  </div>
                  <div className="seat-grid-parallel">
                    {Array.from({ length: effectiveCapacity }, (_, i) => i + 1).map(pos => {
                      const assigned = secAssignments.find(a => Number(a.position) === Number(pos));
                      const isConflict = assigned && isSeatInConflict(sec.id, pos, assigned.guestBrand || assigned.guest_brand);

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
                              onUnassignSeat(assigned.guestId || assigned.guest_id);
                            } else {
                              const matchingUnassigned = unassignedGuests.filter(g => 
                                (g.tier || '').toUpperCase() === (sec.allowed_tier || '').toUpperCase() || 
                                (sec.allowed_tier || '').toUpperCase() === 'GENERAL'
                              );
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
                              <div className="seat-guest-name-text">{assigned.guestName || assigned.guest_name}</div>
                              <div className="seat-guest-brand-text">{assigned.guestBrand || assigned.guest_brand || 'INDEPENDENT'}</div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Live Zoom Broadcast Card */}
          <div className="virtual-stream-banner-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="live-stream-badge">🎥 LIVE ZOOM WEBINAR BROADCAST</span>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', marginTop: '6px' }}>
                  {selectedEvent.name} — Virtual Portal
                </h2>
                
                {/* Dynamic Meeting Credentials */}
                <div style={{ display: 'flex', gap: '18px', marginTop: '8px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                  <div>Meeting ID: <strong style={{ color: '#ffffff', letterSpacing: '0.5px' }}>{streamDetails.meetingId}</strong></div>
                  <div>Passcode: <strong style={{ color: '#ffffff', letterSpacing: '0.5px' }}>{streamDetails.passcode}</strong></div>
                  <div>Direct Link: <strong style={{ color: '#38bdf8' }}>{streamDetails.url}</strong></div>
                </div>
              </div>

              <div>
                <a 
                  href="https://zoom.us/test"
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-couture btn-primary-couture"
                  style={{ background: '#ffffff', color: '#000000', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', fontWeight: '700', borderRadius: '4px', fontSize: '0.88rem' }}
                >
                  🎥 Join Meeting ↗
                </a>
              </div>
            </div>
          </div>

          {/* Guidance on How Guests Access the Link */}
          <div style={{ background: '#f8fafc', borderLeft: '4px solid #0284c7', padding: '12px 16px', fontSize: '0.82rem', color: '#334155', borderRadius: '0 4px 4px 0' }}>
            <strong>💡 How Guests Access the Meeting:</strong> Click <strong>"📋 Copy Invite"</strong> on any issued pass below to copy the guest's verified pass token, Zoom meeting ID (<code>{streamDetails.meetingId}</code>), and passcode (<code>{streamDetails.passcode}</code>).
          </div>


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
                    const guestTierUpper = (g.tier || '').toUpperCase();
                    const matchingSec = sections.find(s => (s.allowed_tier || '').toUpperCase() === guestTierUpper)
                                     || sections.find(s => (s.allowed_tier || '').toUpperCase() === 'GENERAL')
                                     || sections[0];
                    const secAssignments = matchingSec ? assignments.filter(a => Number(a.sectionId || a.section_id) === Number(matchingSec.id)) : [];
                    const usedPositions = new Set(secAssignments.map(a => Number(a.position)));
                    let nextPos = 1;
                    while (usedPositions.has(nextPos)) {
                      nextPos++;
                    }

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
                          onClick={() => handleAssign(g.id, matchingSec ? matchingSec.id : null, nextPos)}
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
                  const secAssignments = assignments.filter(a => Number(a.sectionId || a.section_id) === Number(sec.id));
                  const tierGuestCount = guests.filter(g => g.tier && g.tier.toUpperCase() === (sec.allowed_tier || '').toUpperCase()).length;
                  const effectiveCapacity = Math.max(sec.capacity, tierGuestCount);
                  const capacityPct = effectiveCapacity > 0 ? Math.round((secAssignments.length / effectiveCapacity) * 100) : 0;
                  const matchingUnassigned = unassignedGuests.filter(g => 
                    (g.tier || '').toUpperCase() === (sec.allowed_tier || '').toUpperCase() || 
                    (sec.allowed_tier || '').toUpperCase() === 'GENERAL'
                  );

                  return (
                    <div key={sec.id} className="virtual-column-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className={`tier-pill-minimal ${sec.allowed_tier.toLowerCase()}`}>
                          {sec.allowed_tier.toUpperCase()} TIER
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#444' }}>
                          {secAssignments.length} / {effectiveCapacity} Passes
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
                              const usedPositions = new Set(secAssignments.map(a => Number(a.position)));
                              let nextPos = 1;
                              while (usedPositions.has(nextPos)) {
                                nextPos++;
                              }
                              handleAssign(matchingUnassigned[0].id, sec.id, nextPos);
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
                          secAssignments.map(a => {
                            const isCopied = copiedGuestId === a.guestId;

                            return (
                              <div key={a.id} className="virtual-guest-row">
                                <div>
                                  <div className="guest-name-bold">{a.guestName}</div>
                                  <div className="guest-brand-uppercase" style={{ fontSize: '0.68rem', color: '#666' }}>
                                    {a.guestBrand || 'INDEPENDENT'} • <span style={{ color: '#059669', fontWeight: '700' }}>PASS #{a.id.toString().slice(-4)}</span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                  {/* Dynamic Green State on Copy */}
                                  <button
                                    className="btn-couture"
                                    style={{ 
                                      fontSize: '0.68rem', 
                                      padding: '4px 8px', 
                                      background: isCopied ? '#059669' : '#ffffff',
                                      color: isCopied ? '#ffffff' : '#111111',
                                      borderColor: isCopied ? '#059669' : '#d0d0d0',
                                      fontWeight: '600',
                                      transition: 'all 0.2s ease'
                                    }}
                                    title="Copy personalized invite & Zoom credentials"
                                    onClick={() => handleCopyGuestInvite(a.guestId, a.guestName, a.guestBrand, sec.name, a.id)}
                                  >
                                    {isCopied ? '✓ Copied!' : '📋 Copy Invite'}
                                  </button>

                                  <button 
                                    className="btn-delete-minimal" 
                                    title="Revoke Pass"
                                    onClick={() => onUnassignSeat(a.guestId)}
                                  >
                                    Revoke
                                  </button>
                                </div>
                              </div>
                            );
                          })
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
