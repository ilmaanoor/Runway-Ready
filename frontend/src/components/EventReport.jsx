// EventReport.jsx — Pure React Post-Event Analytics & Protocol Audit Logs
import React from 'react';

export default function EventReport({ selectedEvent, guests = [], sections = [], assignments = [], warningLogs = [] }) {
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

  // 1. Overall Attendance Metrics
  const totalGuests = guests.length;
  const checkedInGuests = guests.filter(g => g.checked_in === 1).length;
  const notArrivedGuests = totalGuests - checkedInGuests;
  const attendanceRate = totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0;
  const nonArrivalRate = totalGuests > 0 ? Math.round((notArrivedGuests / totalGuests) * 100) : 0;

  // Total Section Capacity — use only this event's sections (props already filtered by selectedEvent)
  const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0) || selectedEvent.capacity || 100;
  const totalIssued = assignments.length;
  // For virtual events: denominator is total guests (each guest = 1 pass needed)
  // For physical events: denominator is total section capacity (seats)
  const utilizationDenominator = isPhysical ? totalCapacity : (totalGuests || totalCapacity);
  const passUtilizationPct = utilizationDenominator > 0 ? Math.round((totalIssued / utilizationDenominator) * 100) : 0;

  // 2. Per-Tier Breakdown
  const tiers = ['VIP', 'Press', 'Buyer', 'General'];
  const tierStats = tiers.map(tierName => {
    const tierGuests = guests.filter(g => g.tier.toUpperCase() === tierName.toUpperCase());
    const total = tierGuests.length;
    const checkedIn = tierGuests.filter(g => g.checked_in === 1).length;
    const notArrived = total - checkedIn;
    const arrivalPct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    
    // Find matching section for this tier
    const sec = sections.find(s => s.allowed_tier.toUpperCase() === tierName.toUpperCase());
    // Use effectiveCapacity: if more guests than section capacity, show real count
    const rawCap = sec ? sec.capacity : Math.round(totalCapacity * 0.25);
    const secCap = Math.max(rawCap, total);
    const secAssignments = assignments.filter(a => sec && a.sectionId === sec.id);

    return { 
      tier: tierName, 
      total, 
      checkedIn, 
      notArrived, 
      arrivalPct,
      secCap,
      issuedPasses: secAssignments.length,
      tierNameFull: sec ? sec.name : `${tierName} Stream`
    };
  });

  // 3. Physical Seating Protocol Alerts count (filtered strictly by selected event)
  const eventWarnings = warningLogs.filter(w => Number(w.eventId || w.event_id) === Number(selectedEvent.id));
  const protocolAlerts = eventWarnings.filter(w => w.type === 'separation_alert' || w.type === 'brand_clash').length;
  const tierMismatches = eventWarnings.filter(w => w.type === 'tier_mismatch').length;
  const capacityIssues = eventWarnings.filter(w => w.type === 'capacity_full').length;

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">
          {isPhysical ? 'POST-EVENT ANALYTICAL DASHBOARD' : 'VIRTUAL LIVESTREAM ANALYTICS & AUDIT'}
        </span>
        <h1 className="page-title">
          {isPhysical ? 'Event Performance Report' : 'Virtual Stream Analytics & Roster'}
        </h1>
        <p className="page-description">
          Show: <strong>{selectedEvent.name}</strong> | Format: <strong>{selectedEvent.type}</strong>
        </p>
      </div>

      <div>
        {/* Top Row Metrics: 3 Oversized Metric Cards tailored for Physical vs Virtual */}
        <div className="top-metrics-row">
          
          {/* Metric 1 */}
          <div className="oversized-metric-card">
            <div className="metric-number-massive">{attendanceRate}%</div>
            <div className="metric-label-gray">
              {isPhysical ? 'Gate Check-In Rate' : 'Livestream Check-In Rate'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '4px' }}>
              {checkedInGuests} of {totalGuests} guests verified online
            </div>
          </div>

          {/* Metric 2 */}
          <div className="oversized-metric-card">
            <div className="metric-number-massive">
              {isPhysical ? `${nonArrivalRate}%` : `${passUtilizationPct}%`}
            </div>
            <div className="metric-label-gray">
              {isPhysical ? 'Non-Arrival Rate' : 'Server Pass Utilization'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '4px' }}>
              {isPhysical 
                ? `${notArrivedGuests} guest${notArrivedGuests !== 1 ? 's' : ''} absent from venue` 
                : `${totalIssued} of ${totalGuests} guests have digital passes`
              }
            </div>
          </div>

          {/* Metric 3 */}
          <div className="oversized-metric-card">
            <div className="metric-number-massive">
              {isPhysical ? eventWarnings.length : checkedInGuests}
            </div>
            <div className="metric-label-gray">
              {isPhysical ? 'Seating Protocol Alerts' : 'Active Live Viewers'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '4px' }}>
              {isPhysical 
                ? `${protocolAlerts} separation · ${tierMismatches} tier · ${capacityIssues} capacity`
                : `Connected to Zoom Webinar Broadcast`
              }
            </div>
          </div>
        </div>

        {/* Middle Section: Two Side-by-Side Grid Panels */}
        <div className="report-split-panels" style={{ marginTop: '24px' }}>
          
          {/* Left Panel: Tier-wise Attendance Breakdown */}
          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>{isPhysical ? 'Attendance Breakdown by Tier' : 'Livestream Viewership by Tier'}</h3>
              <p>
                {isPhysical 
                  ? 'Gate check-in status across VIP, Press, Buyer, and General tiers' 
                  : 'Digital pass check-in & access rate per stream tier'
                }
              </p>
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
                          : `${t.arrivalPct}% attended · ${t.checkedIn} online / ${t.total} total`}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${t.arrivalPct}%` }}
                      ></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '3px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t.checkedIn} verified active</span>
                      {!isPhysical && <span>{t.issuedPasses} / {t.secCap} Passes Issued</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel: Protocol Audit Log (Physical) OR Verified Pass Registry (Virtual) */}
          <div className="card-editorial">
            <div className="card-header-couture">
              <h3>
                {isPhysical ? 'Seating Protocol Alert Log' : 'Verified Digital Pass Registry'}
              </h3>
              <p>
                {isPhysical 
                  ? 'Audit trail of physical seating rule flags triggered by the engine' 
                  : 'Live audit of issued Zoom passes, tokens, and attendee authentication'
                }
              </p>
            </div>

            {isPhysical ? (
              /* Physical Conflict Warnings Table */
              eventWarnings.length === 0 ? (
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
                      {eventWarnings.map((w, idx) => {
                        const typeLabel =
                          (w.type === 'separation_alert' || w.type === 'brand_clash') ? 'Separation Protocol' :
                          w.type === 'tier_mismatch'    ? 'Tier Mismatch' :
                          w.type === 'capacity_full'    ? 'Capacity Exceeded' :
                          w.type.replace(/_/g, ' ').toUpperCase();

                        const pillClass =
                          (w.type === 'separation_alert' || w.type === 'brand_clash') ? 'vip' :
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
              )
            ) : (
              /* Virtual Pass Registry Table */
              assignments.length === 0 ? (
                <p style={{ color: '#7d7d7d', marginTop: '16px' }}>
                  No digital passes issued yet. Go to Digital Passes tab to issue passes.
                </p>
              ) : (
                <div className="table-editorial-wrapper" style={{ marginTop: '12px' }}>
                  <table className="table-editorial">
                    <thead>
                      <tr>
                        <th>Attendee &amp; Brand</th>
                        <th>Pass Token</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a, idx) => {
                        const guestObj = guests.find(g => g.id === a.guestId);
                        const isOnline = guestObj && guestObj.checked_in === 1;

                        return (
                          <tr key={idx}>
                            <td>
                              <span className="guest-name-bold">{a.guestName}</span>
                              <span className="guest-brand-uppercase" style={{ fontSize: '0.7rem', color: '#777', display: 'block' }}>
                                {a.guestBrand || 'INDEPENDENT'} • {a.guestTier}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.78rem', color: '#059669', background: '#f0fdf4', padding: '2px 6px', borderRadius: '3px', border: '1px solid #bbf7d0' }}>
                                #RR-{a.id.toString().slice(-4)}
                              </span>
                            </td>
                            <td>
                              {isOnline ? (
                                <span style={{ color: '#059669', fontWeight: '700', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ width: '7px', height: '7px', background: '#059669', borderRadius: '50%', display: 'inline-block' }}></span>
                                  Online Active
                                </span>
                              ) : (
                                <span style={{ color: '#64748b', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ width: '7px', height: '7px', background: '#94a3b8', borderRadius: '50%', display: 'inline-block' }}></span>
                                  Pass Issued
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
