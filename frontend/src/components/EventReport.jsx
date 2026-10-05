// EventReport.jsx — Pure React Event Analytics & Summary (<90 lines)
import React from 'react';

export default function EventReport({ selectedEvent, guests = [], sections = [], assignments = [] }) {
  if (!selectedEvent) return <div className="page-wrapper"><div className="warning-overlay-banner">Please select an event from Dashboard first.</div></div>;

  const total = guests.length;
  const checkedIn = guests.filter(g => g.checked_in === 1).length;
  const attendanceRate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  const passRate = total > 0 ? Math.round((assignments.length / total) * 100) : 0;
  const tiers = ['VIP', 'Press', 'Buyer', 'General'];

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">POST-EVENT AUDIT</span>
        <h1 className="page-title">Event Performance Report</h1>
        <p className="page-description">Show: <strong>{selectedEvent.name}</strong> ({selectedEvent.type})</p>
      </div>

      <div className="top-metrics-row">
        <div className="oversized-metric-card">
          <div className="metric-number-massive">{attendanceRate}%</div>
          <div className="metric-label-gray">Check-In Attendance Rate</div>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>{checkedIn} of {total} guests checked in</div>
        </div>
        <div className="oversized-metric-card">
          <div className="metric-number-massive">{passRate}%</div>
          <div className="metric-label-gray">{selectedEvent.type === 'Physical' ? 'Seat Occupancy Rate' : 'Digital Pass Issuance'}</div>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>{assignments.length} of {total} guests seated/issued</div>
        </div>
        <div className="oversized-metric-card">
          <div className="metric-number-massive">{checkedIn}</div>
          <div className="metric-label-gray">Active Live Attendees</div>
          <div style={{ fontSize: '0.75rem', color: '#888' }}>Verified at gate/stream</div>
        </div>
      </div>

      <div className="report-split-panels" style={{ marginTop: '24px' }}>
        <div className="card-editorial">
          <div className="card-header-couture"><h3>Attendance by Tier</h3><p>Check-in status across guest categories</p></div>
          <div style={{ marginTop: '14px' }}>
            {tiers.map(t => {
              const tg = guests.filter(g => (g.tier || '').toUpperCase() === t.toUpperCase());
              const tc = tg.filter(g => g.checked_in === 1).length;
              const pct = tg.length > 0 ? Math.round((tc / tg.length) * 100) : 0;
              return (
                <div key={t} className="progress-bar-row">
                  <div className="progress-row-header"><span>{t} TIER</span><span>{pct}% ({tc}/{tg.length})</span></div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }}></div></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-editorial">
          <div className="card-header-couture"><h3>{selectedEvent.type === 'Physical' ? 'Seat Assignments Roster' : 'Digital Pass Roster'}</h3><p>Active allocated attendees</p></div>
          {assignments.length === 0 ? <p style={{ color: '#777', marginTop: '14px' }}>No assignments yet.</p> : (
            <div className="table-editorial-wrapper" style={{ marginTop: '10px' }}>
              <table className="table-editorial">
                <thead><tr><th>Attendee & Brand</th><th>Tier</th><th>Seat / Pass #</th></tr></thead>
                <tbody>
                  {assignments.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.guestName || a.guest_name}</strong><br/><small style={{ color: '#777' }}>{a.guestBrand || a.guest_brand || 'Independent'}</small></td>
                      <td><span className={`tier-pill-minimal ${(a.guestTier || a.guest_tier || 'general').toLowerCase()}`}>{a.guestTier || a.guest_tier}</span></td>
                      <td><strong style={{ color: '#059669' }}>#{a.position || a.id}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
