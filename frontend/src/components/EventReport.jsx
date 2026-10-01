// EventReport.jsx — Pure React Post-Event Analytics & Protocol Audit Logs
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

  // 1. Overall Attendance Metrics
  const totalGuests = guests.length;
  const checkedInGuests = guests.filter(g => g.checked_in === 1).length;
  const notArrivedGuests = totalGuests - checkedInGuests;
  // Attendance rate = percentage of guests who checked in
  const attendanceRate = totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0;
  // Non-arrival rate = percentage who have NOT checked in
  const nonArrivalRate = totalGuests > 0 ? Math.round((notArrivedGuests / totalGuests) * 100) : 0;

  // 2. Per-Tier Attendance Breakdown
  const tiers = ['VIP', 'Press', 'Buyer', 'General'];
  const tierStats = tiers.map(tierName => {
    const tierGuests = guests.filter(g => g.tier.toUpperCase() === tierName.toUpperCase());
    const total = tierGuests.length;
    const checkedIn = tierGuests.filter(g => g.checked_in === 1).length;
    const notArrived = total - checkedIn;
    // Non-arrival rate for this tier
    const nonArrivalPct = total > 0 ? Math.round((notArrived / total) * 100) : 0;
    // Attendance rate for this tier
    const arrivalPct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return { tier: tierName, total, checkedIn, notArrived, nonArrivalPct, arrivalPct };
  });

  // 3. Seating Protocol Alerts count
  const protocolAlerts = warningLogs.filter(w => w.type === 'separation_alert').length;
  const tierMismatches = warningLogs.filter(w => w.type === 'tier_mismatch').length;
  const capacityIssues = warningLogs.filter(w => w.type === 'capacity_full').length;

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">POST-EVENT ANALYTICAL DASHBOARD</span>
        <h1 className="page-title">Event Performance Report</h1>
        <p className="page-description">Show: <strong>{selectedEvent.name}</strong> ({selectedEvent.type})</p>
      </div>

      <div>
        {/* Top Row Metrics */}
        <div className="top-metrics-row">
          {/* Metric 1: Attendance Rate */}
          <div className="oversized-metric-card">
            <div className="metric-number-massive">{attendanceRate}%</div>
            <div className="metric-label-gray">Check-In Rate</div>
            <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '4px' }}>
              {checkedInGuests} of {totalGuests} guests arrived
            </div>
          </div>

          {/* Metric 2: Non-Arrival Rate (replaces "No-Show %" — more professional) */}
          <div className="oversized-metric-card">
            <div className="metric-number-massive">{nonArrivalRate}%</div>
            <div className="metric-label-gray">Non-Arrival Rate</div>
            <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '4px' }}>
              {notArrivedGuests} guest{notArrivedGuests !== 1 ? 's' : ''} did not check in
            </div>
          </div>

          {/* Metric 3: Seating Protocol Alerts (replaces "Rule Conflicts Predicted") */}
          <div className="oversized-metric-card">
            <div className="metric-number-massive">{warningLogs.length}</div>
            <div className="metric-label-gray">Seating Protocol Alerts</div>
            <div style={{ fontSize: '0.78rem', color: '#aaa', marginTop: '4px' }}>
              {protocolAlerts} separation · {tierMismatches} tier · {capacityIssues} capacity
            </div>
          </div>
        </div>

        {/* Middle Section: Two Side-by-Side Panels */}
        <div className="report-split-panels" style={{ marginTop: '24px' }}>

          {/* Left Panel: Attendance Breakdown by Tier */}
          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>Attendance Breakdown by Tier</h3>
              <p>Check-in status across VIP, Press, Buyer, and General tiers</p>
            </div>

            {totalGuests === 0 ? (
              <p style={{ color: '#7d7d7d', marginTop: '16px' }}>No guest data recorded for this show.</p>
            ) : (
              <div style={{ marginTop: '16px' }}>
                {tierStats.map((t, idx) => (
                  <div key={idx} className="progress-bar-row">
                    <div className="progress-row-header">
                      <span>{t.tier.toUpperCase()} TIER</span>
                      <span>
                        {t.total === 0
                          ? 'No guests'
                          : `${t.arrivalPct}% arrived · ${t.checkedIn} checked in / ${t.total} total`}
                      </span>
                    </div>
                    {/* Progress bar shows check-in rate (green = arrived) */}
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${t.arrivalPct}%` }}
                      ></div>
                    </div>
                    {t.notArrived > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '3px' }}>
                        {t.notArrived} guest{t.notArrived !== 1 ? 's' : ''} not yet checked in
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Seating Protocol Alert Log */}
          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>Seating Protocol Alert Log</h3>
              <p>Audit trail of all seating rule flags triggered during seat assignment</p>
            </div>

            {warningLogs.length === 0 ? (
              <p style={{ color: '#7d7d7d', marginTop: '16px' }}>
                No protocol alerts recorded. All seating rules were followed correctly.
              </p>
            ) : (
              <div className="table-editorial-wrapper" style={{ marginTop: '12px' }}>
                <table className="table-editorial">
                  <thead>
                    <tr>
                      <th>Alert Type</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warningLogs.map((w, idx) => {
                      // Map internal type codes to readable professional labels
                      const typeLabel =
                        w.type === 'separation_alert' ? 'Separation Protocol' :
                        w.type === 'tier_mismatch'    ? 'Tier Mismatch' :
                        w.type === 'capacity_full'    ? 'Capacity Exceeded' :
                        w.type.replace(/_/g, ' ').toUpperCase();

                      const pillClass =
                        w.type === 'separation_alert' ? 'vip' :
                        w.type === 'tier_mismatch'    ? 'buyer' :
                        'general';

                      return (
                        <tr key={idx}>
                          <td>
                            <span className={`tier-pill-minimal ${pillClass}`}>
                              {typeLabel}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: '#333' }}>
                            {w.message}
                          </td>
                        </tr>
                      );
                    })}
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
