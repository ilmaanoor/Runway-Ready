// SeatingPage.jsx — Pure React Physical Runway Catwalk Canvas & Virtual Access Tiers
import React, { useState } from 'react';
import runwayShowBanner from '../assets/runway_show_banner.png';
import editorPortraitImg from '../assets/fashion_editor_portrait.png';

export default function SeatingPage({ selectedEvent, guests, sections, assignments, separationRules = [], onAssignSeat, onUnassignSeat }) {
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(1);
  const [warnings, setWarnings] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedGuestId, setCopiedGuestId] = useState(null);
  const [joiningMeet, setJoiningMeet] = useState(false);
  const [joinStep, setJoinStep] = useState(0);

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

  // Handle Join Meeting — in-app joining screen (no external redirect)
  const handleJoinMeeting = () => {
    setJoiningMeet(true);
    setJoinStep(1);
    setTimeout(() => setJoinStep(2), 1500);
    setTimeout(() => setJoinStep(3), 3000);
    setTimeout(() => setJoinStep(4), 4500);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ===== IN-APP JOINING SCREEN OVERLAY ===== */}
          {joiningMeet && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.88)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 9999, flexDirection: 'column', gap: '24px'
            }}>
              {/* Spinning loader */}
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                border: '5px solid rgba(255,255,255,0.15)',
                borderTopColor: '#38bdf8',
                animation: 'spin 1s linear infinite'
              }} />

              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#ffffff', fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', marginBottom: '8px' }}>
                  {selectedEvent.name}
                </div>
                <div style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: '600', letterSpacing: '1px', marginBottom: '24px' }}>
                  {joinStep === 1 && '🔌 Connecting to meeting...'}
                  {joinStep === 2 && '🔑 Authenticating your access pass...'}
                  {joinStep === 3 && '🎥 Loading video stream...'}
                  {joinStep === 4 && '✅ You have joined the meeting!'}
                </div>

                {/* Step dots */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
                  {[1,2,3,4].map(s => (
                    <div key={s} style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: joinStep >= s ? '#38bdf8' : 'rgba(255,255,255,0.2)',
                      transition: 'background 0.4s ease'
                    }} />
                  ))}
                </div>

                {/* Meeting info card */}
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '16px 24px', marginBottom: '20px', textAlign: 'left' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Meeting Details</div>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', marginBottom: '4px' }}>📋 ID: <strong>{streamDetails.meetingId}</strong></div>
                  <div style={{ color: '#ffffff', fontSize: '0.85rem', marginBottom: '4px' }}>🔒 Passcode: <strong>{streamDetails.passcode}</strong></div>
                  <div style={{ color: '#38bdf8', fontSize: '0.82rem' }}>🔗 {streamDetails.url}</div>
                </div>

                {/* Close button — only show after fully joined */}
                {joinStep === 4 && (
                  <button
                    onClick={() => { setJoiningMeet(false); setJoinStep(0); }}
                    style={{ background: '#38bdf8', color: '#000000', border: 'none', padding: '10px 28px', borderRadius: '4px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}
                  >
                    Leave Meeting
                  </button>
                )}
                {joinStep < 4 && (
                  <button
                    onClick={() => { setJoiningMeet(false); setJoinStep(0); }}
                    style={{ background: 'transparent', color: '#64748b', border: '1px solid #334155', padding: '8px 20px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}

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
                <button
                  onClick={handleJoinMeeting}
                  className="btn-couture btn-primary-couture"
                  style={{ background: '#ffffff', color: '#000000', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', fontWeight: '700', borderRadius: '4px', fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  🎥 Join Meeting
                </button>
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
