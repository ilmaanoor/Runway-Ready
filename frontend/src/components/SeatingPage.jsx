// SeatingPage.jsx — Pure React Seating Router (<50 lines)
import React from 'react';
import PhysicalSeating from './PhysicalSeating';
import VirtualPasses from './VirtualPasses';

export default function SeatingPage(props) {
  const { selectedEvent } = props;

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

      {isPhysical ? (
        <PhysicalSeating {...props} />
      ) : (
        <VirtualPasses {...props} />
      )}
    </div>
  );
}
