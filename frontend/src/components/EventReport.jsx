// EventReport.jsx — Pure React Post-Event Analytics & Conflict Audit Logs
import React from 'react';

export default function EventReport({ selectedEvent, guests, warningLogs }) {
  if (!selectedEvent) {
    return (
      <div className="page-wrapper">
        <div className="warning-overlay-banner">
          Please select an event from the Dashboard first.
        </div>
      </div>
    );
  }

  // 1. Calculate Overall Attendance Metrics
  const totalGuests = guests.length;
  const checkedInGuests = guests.filter(g => g.checked_in === 1).length;
  const attendanceRate = totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0;

  // 2. Calculate Tier-wise No-Show Rates
  const tiers = ['VIP', 'Press', 'Buyer', 'General'];
  const tierStats = tiers.map(tierName => {
    const tierGuests = guests.filter(g => g.tier.toUpperCase() === tierName.toUpperCase());
    const total = tierGuests.length;
    const checkedIn = tierGuests.filter(g => g.checked_in === 1).length;
    const noShow = total - checkedIn;
    const noShowPct = total > 0 ? Math.round((noShow / total) * 100) : 0;
    return {
      tier: tierName,
      total,
      checkedIn,
      noShow,
      noShowPct
    };
  });

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">POST-EVENT ANALYTICAL DASHBOARD</span>
        <h1 className="page-title">Event Performance Report</h1>
        <p className="page-description">Show: <strong>{selectedEvent.name}</strong> ({selectedEvent.type})</p>
      </div>

      <div>
        {/* Top Row Metrics: 3 Clean Oversized Text Cards */}
        <div className="top-metrics-row">
          <div className="oversized-metric-card">
            <div className="metric-number-massive">{attendanceRate}%</div>
            <div className="metric-label-gray">Attendance Rate (Invited vs. Arrived)</div>
          </div>

          <div className="oversized-metric-card">
            <div className="metric-number-massive">{checkedInGuests}</div>
            <div className="metric-label-gray">Total Checked-In Guests</div>
          </div>

          <div className="oversized-metric-card">
            <div className="metric-number-massive">{warningLogs.length}</div>
            <div className="metric-label-gray">Rule-Engine Conflicts Flagged</div>
          </div>
        </div>

        {/* Middle Section: Two Side-by-Side Grid Panels */}
        <div className="report-split-panels" style={{ marginTop: '24px' }}>
          {/* Left Panel: Progress Bar Chart for No-Show % by Tier */}
          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>No-Show Percentage by Tier</h3>
              <p>Breakdown of absences across VIP, Press, Buyer, and General tiers</p>
            </div>

            {totalGuests === 0 ? (
              <p style={{ color: '#7d7d7d', marginTop: '16px' }}>No guest data recorded for this show.</p>
            ) : (
              <div style={{ marginTop: '16px' }}>
                {tierStats.map((t, idx) => (
                  <div key={idx} className="progress-bar-row">
                    <div className="progress-row-header">
                      <span>{t.tier.toUpperCase()} TIER</span>
                      <span>{t.noShowPct}% No-Show ({t.noShow} of {t.total})</span>
                    </div>
                    <div className="progress-track">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${t.noShowPct}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Rule Engine Conflict Log Summary Table */}
          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>Rule-Engine Conflict Log</h3>
              <p>Audit trail of seating rule violations flagged by the automated engine</p>
            </div>

            {warningLogs.length === 0 ? (
              <p style={{ color: '#7d7d7d', marginTop: '16px' }}>No conflict warnings recorded. All seating rules followed!</p>
            ) : (
              <div className="table-editorial-wrapper" style={{ marginTop: '12px' }}>
                <table className="table-editorial">
                  <thead>
                    <tr>
                      <th>Violation Type</th>
                      <th>Details & Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warningLogs.map((w, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={`tier-pill-minimal ${w.type === 'brand_clash' ? 'vip' : 'general'}`}>
                            {w.type.toUpperCase().replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: '#333' }}>
                          {w.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
