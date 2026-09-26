import React, { useState, useEffect } from 'react';

export default function EventReport({ selectedEvent }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = () => {
    if (!selectedEvent) return;
    setLoading(true);
    fetch(`http://127.0.0.1:5000/api/report/${selectedEvent.id}`)
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch event report.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReport();
  }, [selectedEvent]);

  if (!selectedEvent) {
    return (
      <div className="page-wrapper">
        <div className="warning-overlay-banner">
          Please select an event from the Dashboard first.
        </div>
      </div>
    );
  }

  const attendanceRate = report && report.totals.total_guests > 0 
    ? Math.round((report.totals.checked_in / report.totals.total_guests) * 100) 
    : 0;

  return (
    <div className="page-wrapper">
      <div className="page-header-editorial">
        <span className="section-kicker">POST-EVENT ANALYTICAL DASHBOARD</span>
        <h1 className="page-title">Event Performance Report</h1>
        <p className="page-description">Show: <strong>{selectedEvent.name}</strong> ({selectedEvent.type})</p>
      </div>

      {error && <div className="warning-overlay-banner capacity">{error}</div>}

      {loading || !report ? (
        <p>Loading analytics data...</p>
      ) : (
        <div>
          {/* Top Row Metrics: 3 Clean Oversized Text Cards */}
          <div className="top-metrics-row">
            <div className="oversized-metric-card">
              <div className="metric-number-massive">{attendanceRate}%</div>
              <div className="metric-label-gray">Attendance Rate (Invited vs. Arrived)</div>
            </div>

            <div className="oversized-metric-card">
              <div className="metric-number-massive">{report.totals.checked_in}</div>
              <div className="metric-label-gray">Total Checked-In Guests</div>
            </div>

            <div className="oversized-metric-card">
              <div className="metric-number-massive">{report.warnings_summary.total_warnings}</div>
              <div className="metric-label-gray">Rule-Engine Conflicts Prevented</div>
            </div>
          </div>

          {/* Middle Section: Two Side-by-Side Grid Panels */}
          <div className="report-split-panels">
            {/* Left Panel: Progress Bar Chart for No-Show % by Tier */}
            <div className="card-editorial">
              <div className="card-header-couture">
                <h3>No-Show Percentage by Tier</h3>
                <p>Breakdown of absences across VIP, Press, Buyer, and General tiers</p>
              </div>

              {report.tier_stats.length === 0 ? (
                <p style={{ color: '#7d7d7d' }}>No guest data recorded.</p>
              ) : (
                <div style={{ marginTop: '16px' }}>
                  {report.tier_stats.map((t, idx) => (
                    <div key={idx} className="progress-bar-row">
                      <div className="progress-row-header">
                        <span>{t.tier.toUpperCase()} TIER</span>
                        <span>{t.no_show_pct}% No-Show ({t.no_show} of {t.total})</span>
                      </div>
                      <div className="progress-track">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${t.no_show_pct}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Panel: Rule-Engine Conflicts Prevented Summary */}
            <div className="card-editorial">
              <div className="card-header-couture">
                <h3>Rule-Engine Conflict Log</h3>
                <p>Summary of policy checks caught by the system</p>
              </div>

              <table className="table-editorial">
                <thead>
                  <tr>
                    <th>Conflict Type</th>
                    <th>Color Code</th>
                    <th>Events Prevented</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Tier Mismatches</strong></td>
                    <td><span style={{ color: '#d97706', fontWeight: 'bold' }}>■ Ochre</span></td>
                    <td><strong>{report.warnings_summary.tier_mismatch}</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Brand Clashes</strong></td>
                    <td><span style={{ color: '#dc2626', fontWeight: 'bold' }}>■ Deep Crimson</span></td>
                    <td><strong>{report.warnings_summary.brand_clash}</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Capacity Full Blocks</strong></td>
                    <td><span style={{ color: '#4b5563', fontWeight: 'bold' }}>■ Muted Slate</span></td>
                    <td><strong>{report.warnings_summary.capacity_full}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
