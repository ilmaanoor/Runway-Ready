// PhysicalSeating.jsx — Runway Catwalk Grid & Adjacent Brand Conflict Check
import React, { useState } from 'react';
import runwayBanner from '../assets/runway_show_banner.png';
import editorPortrait from '../assets/fashion_editor_portrait.png';

export default function PhysicalSeating({ selectedEvent, guests, sections, assignments, separationRules, onAssignSeat, onUnassignSeat, onUpdateSectionCapacity }) {
  const [selectedGuestId, setSelectedGuestId] = useState(null);
  const unassigned = guests.filter(g => !assignments.some(a => Number(a.guestId || a.guest_id) === Number(g.id)));

  const isConflict = (secId, pos, brand) => {
    if (!brand || !separationRules?.length) return false;
    const b = brand.trim().toLowerCase();
    const adj = assignments.filter(a => 
      Number(a.sectionId || a.section_id) === Number(secId) && 
      (Number(a.position) === pos - 1 || Number(a.position) === pos + 1)
    );
    return adj.some(a => {
      const ab = (a.guestBrand || a.guest_brand || '').trim().toLowerCase();
      if (!ab) return false;
      return separationRules.some(r => {
        const rA = (r.brandA || r.brand_a || '').trim().toLowerCase();
        const rB = (r.brandB || r.brand_b || '').trim().toLowerCase();
        return (rA === b && rB === ab) || (rB === b && rA === ab);
      });
    });
  };

  return (
    <div className="seating-split-layout">
      <div className="unassigned-sidebar">
        <h3 className="sidebar-title">Unassigned Guests ({unassigned.length})</h3>
        <div className="unassigned-guest-list">
          {unassigned.length === 0 ? <p style={{ fontSize: '0.8rem', color: '#777' }}>All guests seated!</p> : (
            unassigned.map(g => (
              <div key={g.id} className={`unassigned-guest-item ${selectedGuestId === g.id ? 'selected' : ''}`} onClick={() => setSelectedGuestId(prev => prev === g.id ? null : g.id)}>
                <div className="guest-name-bold">{g.name}</div>
                <div className="guest-brand-uppercase">{g.brand || 'INDEPENDENT'} • <span className={`tier-pill-minimal ${g.tier.toLowerCase()}`}>{g.tier}</span></div>
              </div>
            ))
          )}
        </div>
        <div className="editorial-frame-card" style={{ marginTop: '20px' }}><img src={editorPortrait} alt="Editor" className="sidebar-editorial-img" /></div>
      </div>

      <div className="runway-main-canvas">
        <div className="runway-banner-container"><img src={runwayBanner} alt="Runway" className="runway-banner-img" /><div className="runway-banner-overlay-text">RUNWAY CATWALK SHOWCASE</div></div>
        <div className="runway-stage-center">R U N W A Y</div>

        {sections.map(sec => {
          const secAssg = assignments.filter(a => Number(a.sectionId || a.section_id) === Number(sec.id));
          const tierCount = guests.filter(g => (g.tier || '').toUpperCase() === (sec.allowed_tier || '').toUpperCase()).length;
          const cap = Math.max(sec.capacity, tierCount);

          return (
            <div key={sec.id} className="seat-row-block">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h4 className="section-block-title" style={{ margin: 0 }}>{sec.name} — {secAssg.length} / {cap}</h4>
                {onUpdateSectionCapacity && <button onClick={() => onUpdateSectionCapacity(sec.id, cap + 1)} style={{ fontSize: '0.72rem', padding: '2px 6px' }}>+ Add Seat</button>}
              </div>
              <div className="seat-grid-parallel">
                {Array.from({ length: cap }, (_, i) => i + 1).map(pos => {
                  const a = secAssg.find(x => Number(x.position) === pos);
                  const clash = a && isConflict(sec.id, pos, a.guestBrand || a.guest_brand);
                  return (
                    <div key={pos} className={`seat-square-block ${a ? 'occupied' : ''} ${clash ? 'has-conflict' : ''}`} style={{ cursor: 'pointer' }} onClick={() => {
                      if (a) onUnassignSeat(a.guestId || a.guest_id);
                      else {
                        const match = unassigned.filter(g => (g.tier || '').toUpperCase() === (sec.allowed_tier || '').toUpperCase() || sec.allowed_tier === 'General');
                        const target = selectedGuestId || (match[0] ? match[0].id : null);
                        if (target) onAssignSeat(target, sec.id, pos);
                        else alert(`No unassigned ${sec.allowed_tier} guests available!`);
                      }
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="seat-num-tag">Seat {pos}</span>{clash && <span className="seat-conflict-indicator">⚠️ CONFLICT</span>}</div>
                      {a ? <div><div className="seat-guest-name-text">{a.guestName || a.guest_name}</div><div className="seat-guest-brand-text">{a.guestBrand || a.guest_brand || 'INDEPENDENT'}</div></div> : <span style={{ fontWeight: 'bold', fontSize: '0.75rem' }}>+ Vacant</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
