// VirtualPasses.jsx — Digital Stream Passes & Zoom Credential Portal (<90 lines)
import React, { useState } from 'react';

export default function VirtualPasses({ selectedEvent, guests, sections, assignments, onAssignSeat, onUnassignSeat }) {
  const [copiedId, setCopiedId] = useState(null);
  const unassigned = guests.filter(g => !assignments.some(a => Number(a.guestId || a.guest_id) === Number(g.id)));

  const copyInvite = (gid, name, brand, tier, passId) => {
    const text = `RUNWAY ACCESS PASS\nEvent: ${selectedEvent.name}\nGuest: ${name} (${brand})\nTier: ${tier}\nPass: #RR-${passId}\nLink: ${selectedEvent.location || 'https://zoom.us/test'}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(gid);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      alert(text);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="virtual-stream-banner-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="live-stream-badge">🎥 LIVE ZOOM WEBINAR</span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', margin: '6px 0' }}>{selectedEvent.name} — Virtual Portal</h2>
          <p style={{ fontSize: '0.82rem', margin: 0 }}>Join Link: <strong style={{ color: '#38bdf8' }}>{selectedEvent.location || 'https://zoom.us/test'}</strong></p>
        </div>
        <a href={selectedEvent.location || 'https://zoom.us/test'} target="_blank" rel="noreferrer" className="btn-couture btn-primary-couture" style={{ background: '#fff', color: '#000', textDecoration: 'none' }}>🎥 Join Meeting ↗</a>
      </div>

      <div className="seating-split-layout">
        <div className="unassigned-sidebar">
          <h3 className="sidebar-title">Pending Pass Requests ({unassigned.length})</h3>
          <div className="unassigned-guest-list">
            {unassigned.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#777' }}>All digital passes issued!</p> : (
              unassigned.map(g => {
                const sec = sections.find(s => (s.allowed_tier || '').toUpperCase() === (g.tier || '').toUpperCase()) || sections[0];
                const secAssg = sec ? assignments.filter(a => Number(a.sectionId || a.section_id) === Number(sec.id)) : [];
                return (
                  <div key={g.id} className="unassigned-guest-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div className="guest-name-bold">{g.name}</div><div className="guest-brand-uppercase">{g.brand || 'INDEPENDENT'} • {g.tier}</div></div>
                    <button className="btn-couture btn-secondary-couture" style={{ fontSize: '0.7rem' }} onClick={() => sec && onAssignSeat(g.id, sec.id, secAssg.length + 1)}>+ Issue Pass</button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div className="virtual-four-grid">
            {sections.map(sec => {
              const secAssg = assignments.filter(a => Number(a.sectionId || a.section_id) === Number(sec.id));
              const match = unassigned.filter(g => (g.tier || '').toUpperCase() === (sec.allowed_tier || '').toUpperCase() || sec.allowed_tier === 'General');
              return (
                <div key={sec.id} className="virtual-column-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className={`tier-pill-minimal ${sec.allowed_tier.toLowerCase()}`}>{sec.allowed_tier} TIER</span><span>{secAssg.length} Passes</span></div>
                  <h3 className="virtual-column-title" style={{ margin: '8px 0' }}>{sec.name}</h3>
                  {match.length > 0 && <button className="btn-couture btn-primary-couture" style={{ fontSize: '0.7rem', width: '100%', marginBottom: '10px' }} onClick={() => onAssignSeat(match[0].id, sec.id, secAssg.length + 1)}>+ Issue Next Pass</button>}
                  <div className="virtual-guest-list">
                    {secAssg.map(a => (
                      <div key={a.id} className="virtual-guest-row">
                        <div><div className="guest-name-bold">{a.guestName || a.guest_name}</div><div style={{ fontSize: '0.7rem', color: '#666' }}>{a.guestBrand || 'INDEPENDENT'} • <span style={{ color: '#059669' }}>PASS #{a.id}</span></div></div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn-couture" style={{ fontSize: '0.68rem', padding: '3px 6px' }} onClick={() => copyInvite(a.guestId || a.guest_id, a.guestName || a.guest_name, a.guestBrand || a.guest_brand, sec.name, a.id)}>{copiedId === (a.guestId || a.guest_id) ? '✓ Copied' : '📋 Copy'}</button>
                          <button className="btn-delete-minimal" onClick={() => onUnassignSeat(a.guestId || a.guest_id)}>Revoke</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
