// RUNWAY READY — Main Application Root Component
// Pure React Application built for Stella Maris College BCA Coursework
// 2-Tier Architecture: Admin (Supervisor) & Event Coordinator (Staff)

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GuestList from './components/GuestList';
import SeatingPage from './components/SeatingPage';
import Admin from './components/Admin';
import EventReport from './components/EventReport';
import './App.css';

// Initial Mock Data Arrays (Pure JavaScript Objects - No JSON or APIs needed)
const INITIAL_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@runway.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Event Coordinator', email: 'coordinator@runway.com', password: 'staff123', role: 'coordinator' }
];

const INITIAL_EVENTS = [
  { 
    id: 1, 
    name: 'Milan Haute Couture Gala 2027', 
    date: '2027-05-15', 
    type: 'Physical', 
    location: 'Palazzo Reale, Milan', 
    capacity: 200, 
    description: 'Annual Milan Fashion Week Exclusive Runway Showcase' 
  },
  { 
    id: 2, 
    name: 'Paris Fashion Week 2026', 
    date: '2026-10-20', 
    type: 'Physical', 
    location: 'Grand Palais, Paris', 
    capacity: 150, 
    description: 'Spring / Summer Haute Couture Collection' 
  },
  { 
    id: 3, 
    name: 'Chanel Virtual Runway Experience', 
    date: '2026-11-05', 
    type: 'Virtual', 
    location: 'https://live.chanel.com', 
    capacity: 500, 
    description: 'Global Digital Livestream & Interactive VR Access' 
  }
];

// INITIAL_SECTIONS: capacities are proportional to each event's total capacity
// Event 1 = 200 seats, Event 2 = 150 seats, Event 3 = 500 (virtual)
// Distribution: VIP 20%, Press 20%, Buyer 25%, General 35%
const INITIAL_SECTIONS = [
  // Sections for Event 1 (Physical, capacity=200)
  { id: 1, eventId: 1, name: 'Front Row A (VIP)',       allowed_tier: 'VIP',     capacity: 40  },
  { id: 2, eventId: 1, name: 'Press Box B (Press)',     allowed_tier: 'Press',   capacity: 40  },
  { id: 3, eventId: 1, name: 'Buyer Lounge C (Buyer)',  allowed_tier: 'Buyer',   capacity: 50  },
  { id: 4, eventId: 1, name: 'General Gallery D',       allowed_tier: 'General', capacity: 70  },

  // Sections for Event 2 (Physical, capacity=150)
  { id: 5, eventId: 2, name: 'Front Row A (VIP)',       allowed_tier: 'VIP',     capacity: 30  },
  { id: 6, eventId: 2, name: 'Press Row B (Press)',     allowed_tier: 'Press',   capacity: 30  },
  { id: 7, eventId: 2, name: 'Buyer Lounge C (Buyer)',  allowed_tier: 'Buyer',   capacity: 37  },
  { id: 8, eventId: 2, name: 'General Gallery D',       allowed_tier: 'General', capacity: 53  },

  // Sections for Event 3 (Virtual, capacity=500)
  { id: 9,  eventId: 3, name: 'VIP Stream Access',       allowed_tier: 'VIP',     capacity: 100 },
  { id: 10, eventId: 3, name: 'Press Media Access',      allowed_tier: 'Press',   capacity: 100 },
  { id: 11, eventId: 3, name: 'Buyer Pass Access',       allowed_tier: 'Buyer',   capacity: 125 },
  { id: 12, eventId: 3, name: 'General Audience Stream', allowed_tier: 'General', capacity: 175 }
];

const INITIAL_GUESTS = [
  { id: 1, eventId: 1, name: 'Anna Wintour',      tier: 'VIP',     brand: 'Chanel',      checked_in: 1 },
  { id: 2, eventId: 1, name: 'Bernard Arnault',   tier: 'VIP',     brand: 'Dior',        checked_in: 0 },
  { id: 3, eventId: 1, name: 'Edward Enninful',   tier: 'Press',   brand: 'Vogue',       checked_in: 1 },
  { id: 4, eventId: 1, name: 'Hailey Bieber',     tier: 'General', brand: 'Independent', checked_in: 0 },
  { id: 5, eventId: 1, name: 'Milan Retail Buyer',tier: 'Buyer',   brand: 'Prada',       checked_in: 0 }
];

// "Seating Separation Protocol" — replaces "Rival Brands" terminology.
// These are pairs of brands that should NOT be seated adjacent to each other
// as per fashion industry seating etiquette (not "rivals" — just preferred separation).
const INITIAL_SEPARATION = [
  { id: 1, brandA: 'Chanel', brandB: 'Dior' },
  { id: 2, brandA: 'Gucci',  brandB: 'Balenciaga' },
  { id: 3, brandA: 'Prada',  brandB: 'Armani' }
];

export default function App() {
  // 1. MAIN APPLICATION STATE
  // Each state loads from localStorage first; falls back to INITIAL data if nothing saved yet.
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('rr_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [activePage, setActivePage] = useState(() => {
    const saved = localStorage.getItem('rr_activePage');
    return saved ? saved : 'login';
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('rr_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('rr_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [guests, setGuests] = useState(() => {
    const saved = localStorage.getItem('rr_guests');
    return saved ? JSON.parse(saved) : INITIAL_GUESTS;
  });

  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem('rr_sections');
    return saved ? JSON.parse(saved) : INITIAL_SECTIONS;
  });

  const [seatAssignments, setSeatAssignments] = useState(() => {
    const saved = localStorage.getItem('rr_assignments');
    return saved ? JSON.parse(saved) : [];
  });

  const [separationRules, setSeparationRules] = useState(() => {
    const saved = localStorage.getItem('rr_separation');
    return saved ? JSON.parse(saved) : INITIAL_SEPARATION;
  });

  const [warningLogs, setWarningLogs] = useState(() => {
    const saved = localStorage.getItem('rr_warnings');
    return saved ? JSON.parse(saved) : [];
  });

  // selectedEvent: restore from localStorage or default to first event
  const [selectedEvent, setSelectedEvent] = useState(() => {
    const savedEvents = localStorage.getItem('rr_events');
    const evList = savedEvents ? JSON.parse(savedEvents) : INITIAL_EVENTS;
    const savedSelectedId = localStorage.getItem('rr_selectedEventId');
    if (savedSelectedId) {
      const parsedId = JSON.parse(savedSelectedId);
      const found = evList.find(e => e.id === parsedId);
      if (found) return found;
    }
    return evList[0] || null;
  });

  // 2. AUTO-SAVE: whenever any state changes, save it to localStorage
  useEffect(() => { localStorage.setItem('rr_users',       JSON.stringify(users));        }, [users]);
  useEffect(() => { localStorage.setItem('rr_events',      JSON.stringify(events));       }, [events]);
  useEffect(() => { localStorage.setItem('rr_guests',      JSON.stringify(guests));       }, [guests]);
  useEffect(() => { localStorage.setItem('rr_sections',    JSON.stringify(sections));     }, [sections]);
  useEffect(() => { localStorage.setItem('rr_assignments', JSON.stringify(seatAssignments)); }, [seatAssignments]);
  useEffect(() => { localStorage.setItem('rr_separation',  JSON.stringify(separationRules)); }, [separationRules]);
  useEffect(() => { localStorage.setItem('rr_warnings',    JSON.stringify(warningLogs));  }, [warningLogs]);
  useEffect(() => {
    if (selectedEvent) {
      localStorage.setItem('rr_selectedEventId', JSON.stringify(selectedEvent.id));
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rr_currentUser', JSON.stringify(currentUser));
      localStorage.setItem('rr_activePage', activePage);
    } else {
      localStorage.removeItem('rr_currentUser');
      localStorage.removeItem('rr_activePage');
    }
  }, [currentUser, activePage]);

  // 2. AUTHENTICATION (Login / Logout)
  const handleLogin = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'coordinator') {
        setActivePage('guests'); // Coordinator lands directly on Guest Operations
      } else {
        setActivePage('dashboard'); // Admin lands on Dashboard
      }
      return { success: true };
    } else {
      return { success: false, message: 'Invalid email address or password. Please try again!' };
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('login');
    localStorage.removeItem('rr_currentUser');
    localStorage.removeItem('rr_activePage');
  };

  // 3. EVENT CRUD OPERATIONS
  const handleAddEvent = (newEventData) => {
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const newEvent = { id: newId, ...newEventData };
    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);

    // Calculate section capacities from the event's total capacity (cinema-style)
    const total = parseInt(newEventData.capacity) || 100;
    const vipCap     = Math.max(1, Math.round(total * 0.20)); // 20% VIP
    const pressCap   = Math.max(1, Math.round(total * 0.20)); // 20% Press
    const buyerCap   = Math.max(1, Math.round(total * 0.25)); // 25% Buyer
    const generalCap = Math.max(1, total - vipCap - pressCap - buyerCap); // Remaining

    // Create default sections proportional to event capacity
    const newSections = newEventData.type === 'Physical' ? [
      { id: Date.now() + 1, eventId: newId, name: 'Front Row A (VIP)',      allowed_tier: 'VIP',     capacity: vipCap     },
      { id: Date.now() + 2, eventId: newId, name: 'Press Box B (Press)',    allowed_tier: 'Press',   capacity: pressCap   },
      { id: Date.now() + 3, eventId: newId, name: 'Buyer Lounge C (Buyer)', allowed_tier: 'Buyer',   capacity: buyerCap   },
      { id: Date.now() + 4, eventId: newId, name: 'General Gallery D',      allowed_tier: 'General', capacity: generalCap }
    ] : [
      { id: Date.now() + 1, eventId: newId, name: 'VIP Stream Access',       allowed_tier: 'VIP',     capacity: vipCap     },
      { id: Date.now() + 2, eventId: newId, name: 'Press Media Access',      allowed_tier: 'Press',   capacity: pressCap   },
      { id: Date.now() + 3, eventId: newId, name: 'Buyer Pass Access',       allowed_tier: 'Buyer',   capacity: buyerCap   },
      { id: Date.now() + 4, eventId: newId, name: 'General Audience Stream', allowed_tier: 'General', capacity: generalCap }
    ];

    setSections([...sections, ...newSections]);
    setSelectedEvent(newEvent);
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter(e => e.id !== eventId);
    setEvents(updatedEvents);
    setSections(sections.filter(s => s.eventId !== eventId));
    setGuests(guests.filter(g => g.eventId !== eventId));
    setSeatAssignments(seatAssignments.filter(s => s.eventId !== eventId));
    setWarningLogs(warningLogs.filter(w => w.eventId !== eventId));

    if (selectedEvent && selectedEvent.id === eventId) {
      setSelectedEvent(updatedEvents.length > 0 ? updatedEvents[0] : null);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    if (currentUser && currentUser.role === 'coordinator') {
      setActivePage('guests');
    } else {
      setActivePage('seating');
    }
  };

  // 4. GUEST CRUD OPERATIONS
  const handleAddGuest = (guestData) => {
    const newId = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;
    const newGuest = {
      id: newId,
      eventId: selectedEvent.id,
      name: guestData.name,
      tier: guestData.tier,
      brand: guestData.brand || '',
      checked_in: 0
    };
    setGuests([...guests, newGuest]);
  };

  const handleDeleteGuest = (guestId) => {
    setGuests(guests.filter(g => g.id !== guestId));
    setSeatAssignments(seatAssignments.filter(s => s.guestId !== guestId));
  };

  const handleToggleCheckin = (guestId) => {
    setGuests(guests.map(g => {
      if (g.id === guestId) {
        return { ...g, checked_in: g.checked_in === 1 ? 0 : 1 };
      }
      return g;
    }));
  };

  // 5. SEATING ASSIGNMENT & RULE ENGINE
  const handleAssignSeat = (guestId, sectionId, position) => {
    const guest = guests.find(g => g.id === parseInt(guestId));
    const section = sections.find(s => s.id === parseInt(sectionId));

    if (!guest || !section) {
      return { success: false, error: 'Guest or Section not found.' };
    }

    // RULE 1: Strict Tier Enforcement (Block Mismatches)
    if (guest.tier !== section.allowed_tier) {
      const err = `STRICT TIER ENFORCEMENT: Guest '${guest.name}' holds a ${guest.tier} ticket and can ONLY be assigned to a ${guest.tier} section (Section '${section.name}' requires ${section.allowed_tier} tier).`;
      setWarningLogs([...warningLogs, { id: Date.now(), eventId: selectedEvent.id, type: 'tier_mismatch', message: err }]);
      return { success: false, error: err };
    }

    // RULE 2: Capacity Limit Check
    const currentOccupancy = seatAssignments.filter(s => s.sectionId === section.id && s.guestId !== guest.id).length;
    if (currentOccupancy >= section.capacity) {
      const err = `Capacity Overflow: Section '${section.name}' is full (Max Capacity: ${section.capacity}).`;
      setWarningLogs([...warningLogs, { id: Date.now(), eventId: selectedEvent.id, type: 'capacity_full', message: err }]);
      return { success: false, error: err };
    }

    // RULE 3: Seating Separation Protocol Check
    // Checks if the guest's brand and any adjacent guest's brand are flagged for separation
    const warnings = [];
    const adjAssignments = seatAssignments.filter(s => 
      s.sectionId === section.id && 
      (s.position === position - 1 || s.position === position + 1) && 
      s.guestId !== guest.id
    );

    if (guest.brand) {
      const guestBrandLower = guest.brand.trim().toLowerCase();
      adjAssignments.forEach(adj => {
        const adjGuest = guests.find(g => g.id === adj.guestId);
        if (adjGuest && adjGuest.brand) {
          const adjBrandLower = adjGuest.brand.trim().toLowerCase();
          const isFlagged = separationRules.some(r => 
            (r.brandA.toLowerCase() === guestBrandLower && r.brandB.toLowerCase() === adjBrandLower) ||
            (r.brandB.toLowerCase() === guestBrandLower && r.brandA.toLowerCase() === adjBrandLower)
          );

          if (isFlagged) {
            const warn = `SEATING SEPARATION PROTOCOL: '${guest.name}' (${guest.brand}) and '${adjGuest.name}' (${adjGuest.brand}) have a preferred separation rule. Consider reassigning to maintain seating protocol. (Seat ${position} adjacent to Seat ${adj.position}).`;
            warnings.push({ type: 'separation_alert', message: warn });
            setWarningLogs(prev => [...prev, { id: Date.now() + Math.random(), eventId: selectedEvent.id, type: 'separation_alert', message: warn }]);
          }
        }
      });
    }

    // Update or Add Seat Assignment
    const remaining = seatAssignments.filter(s => s.guestId !== guest.id);
    const newAssignment = {
      id: Date.now(),
      eventId: selectedEvent.id,
      guestId: guest.id,
      guestName: guest.name,
      guestTier: guest.tier,
      guestBrand: guest.brand,
      sectionId: section.id,
      position: position
    };
    setSeatAssignments([...remaining, newAssignment]);

    return { 
      success: true, 
      message: `Assigned ${guest.name} to ${section.name} - Seat ${position}`,
      warnings: warnings 
    };
  };

  const handleUnassignSeat = (guestId) => {
    setSeatAssignments(seatAssignments.filter(s => s.guestId !== guestId));
  };

  // 6. ADMIN MANAGEMENT (Users & Seating Separation Protocol Rules)
  const handleAddUser = (userData) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, { id: newId, ...userData }]);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleAddSeparationRule = (brandA, brandB) => {
    const newId = separationRules.length > 0 ? Math.max(...separationRules.map(r => r.id)) + 1 : 1;
    setSeparationRules([...separationRules, { id: newId, brandA, brandB }]);
  };

  const handleDeleteSeparationRule = (ruleId) => {
    setSeparationRules(separationRules.filter(r => r.id !== ruleId));
  };

  // 7. COMPONENT RENDER
  return (
    <div className="app-root">
      <Navbar 
        currentUser={currentUser} 
        activePage={activePage} 
        setActivePage={setActivePage}
        eventsList={events}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {!currentUser ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            {activePage === 'dashboard' && (
              <Dashboard 
                currentUser={currentUser}
                events={events}
                onAddEvent={handleAddEvent}
                onDeleteEvent={handleDeleteEvent}
                onSelectEvent={handleSelectEvent} 
                activeSelectedEvent={selectedEvent} 
              />
            )}

            {activePage === 'guests' && (
              <GuestList 
                selectedEvent={selectedEvent}
                guests={guests.filter(g => g.eventId === selectedEvent.id)}
                onAddGuest={handleAddGuest}
                onDeleteGuest={handleDeleteGuest}
                onToggleCheckin={handleToggleCheckin}
              />
            )}

            {activePage === 'seating' && (
              <SeatingPage 
                selectedEvent={selectedEvent}
                guests={guests.filter(g => g.eventId === selectedEvent.id)}
                sections={sections.filter(s => s.eventId === selectedEvent.id)}
                assignments={seatAssignments.filter(s => s.eventId === selectedEvent.id)}
                onAssignSeat={handleAssignSeat}
                onUnassignSeat={handleUnassignSeat}
              />
            )}

            {activePage === 'admin' && currentUser.role === 'admin' && (
              <Admin 
                selectedEvent={selectedEvent}
                users={users}
                separationRules={separationRules}
                sections={sections.filter(s => s.eventId === selectedEvent.id)}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onAddSeparationRule={handleAddSeparationRule}
                onDeleteSeparationRule={handleDeleteSeparationRule}
              />
            )}

            {activePage === 'report' && currentUser.role === 'admin' && (
              <EventReport 
                selectedEvent={selectedEvent}
                guests={guests.filter(g => g.eventId === selectedEvent.id)}
                warningLogs={warningLogs.filter(w => w.eventId === selectedEvent.id)}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Runway Ready © 2027 — Fashion Show Seating & Access Coordination System</p>
      </footer>
    </div>
  );
}
