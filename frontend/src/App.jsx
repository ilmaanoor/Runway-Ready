// RUNWAY READY — Main Application Root Component
// Pure React Application built for Stella Maris College BCA Coursework
// 2-Tier Architecture: Admin (Supervisor) & Event Coordinator (Staff)

import React, { useState } from 'react';
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

const INITIAL_SECTIONS = [
  // Sections for Event 1 (Physical)
  { id: 1, eventId: 1, name: 'Front Row A (VIP)', allowed_tier: 'VIP', capacity: 5 },
  { id: 2, eventId: 1, name: 'Press Box B (Press)', allowed_tier: 'Press', capacity: 6 },
  { id: 3, eventId: 1, name: 'Buyer Lounge C (Buyer)', allowed_tier: 'Buyer', capacity: 8 },
  { id: 4, eventId: 1, name: 'General Gallery D', allowed_tier: 'General', capacity: 10 },

  // Sections for Event 2 (Physical)
  { id: 5, eventId: 2, name: 'Front Row A (VIP)', allowed_tier: 'VIP', capacity: 5 },
  { id: 6, eventId: 2, name: 'Press Row B (Press)', allowed_tier: 'Press', capacity: 6 },
  { id: 7, eventId: 2, name: 'Buyer Lounge C (Buyer)', allowed_tier: 'Buyer', capacity: 8 },
  { id: 8, eventId: 2, name: 'General Gallery D', allowed_tier: 'General', capacity: 10 },

  // Sections for Event 3 (Virtual)
  { id: 9, eventId: 3, name: 'VIP Stream Access', allowed_tier: 'VIP', capacity: 100 },
  { id: 10, eventId: 3, name: 'Press Media Access', allowed_tier: 'Press', capacity: 100 },
  { id: 11, eventId: 3, name: 'Buyer Pass Access', allowed_tier: 'Buyer', capacity: 100 },
  { id: 12, eventId: 3, name: 'General Audience Stream', allowed_tier: 'General', capacity: 500 }
];

const INITIAL_GUESTS = [
  { id: 1, eventId: 1, name: 'Anna Wintour', tier: 'VIP', brand: 'Chanel', checked_in: 1 },
  { id: 2, eventId: 1, name: 'Bernard Arnault', tier: 'VIP', brand: 'Dior', checked_in: 0 },
  { id: 3, eventId: 1, name: 'Edward Enninful', tier: 'Press', brand: 'Vogue', checked_in: 1 },
  { id: 4, eventId: 1, name: 'Hailey Bieber', tier: 'General', brand: 'Independent', checked_in: 0 },
  { id: 5, eventId: 1, name: 'Milan Retail Buyer', tier: 'Buyer', brand: 'Prada', checked_in: 0 }
];

const INITIAL_RIVALS = [
  { id: 1, brandA: 'Chanel', brandB: 'Dior' },
  { id: 2, brandA: 'Gucci', brandB: 'Balenciaga' },
  { id: 3, brandA: 'Prada', brandB: 'Armani' }
];

export default function App() {
  // 1. MAIN APPLICATION STATE (React useState Hooks)
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('login');
  const [selectedEvent, setSelectedEvent] = useState(INITIAL_EVENTS[0]);

  // Master Data State
  const [users, setUsers] = useState(INITIAL_USERS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [guests, setGuests] = useState(INITIAL_GUESTS);
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [seatAssignments, setSeatAssignments] = useState([]);
  const [rivalBrands, setRivalBrands] = useState(INITIAL_RIVALS);
  const [warningLogs, setWarningLogs] = useState([]);

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
  };

  // 3. EVENT CRUD OPERATIONS
  const handleAddEvent = (newEventData) => {
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const newEvent = { id: newId, ...newEventData };
    setEvents([newEvent, ...events]);

    // Create default sections for the new event
    const newSections = newEventData.type === 'Physical' ? [
      { id: Date.now() + 1, eventId: newId, name: 'Front Row A (VIP)', allowed_tier: 'VIP', capacity: 5 },
      { id: Date.now() + 2, eventId: newId, name: 'Press Box B (Press)', allowed_tier: 'Press', capacity: 6 },
      { id: Date.now() + 3, eventId: newId, name: 'Buyer Lounge C (Buyer)', allowed_tier: 'Buyer', capacity: 8 },
      { id: Date.now() + 4, eventId: newId, name: 'General Gallery D', allowed_tier: 'General', capacity: 10 }
    ] : [
      { id: Date.now() + 1, eventId: newId, name: 'VIP Stream Access', allowed_tier: 'VIP', capacity: 100 },
      { id: Date.now() + 2, eventId: newId, name: 'Press Media Access', allowed_tier: 'Press', capacity: 100 },
      { id: Date.now() + 3, eventId: newId, name: 'Buyer Pass Access', allowed_tier: 'Buyer', capacity: 100 },
      { id: Date.now() + 4, eventId: newId, name: 'General Audience Stream', allowed_tier: 'General', capacity: 500 }
    ];

    setSections([...sections, ...newSections]);
    setSelectedEvent(newEvent);
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

    // RULE 3: Rival Brand Clash Detection
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
          const isRival = rivalBrands.some(r => 
            (r.brandA.toLowerCase() === guestBrandLower && r.brandB.toLowerCase() === adjBrandLower) ||
            (r.brandB.toLowerCase() === guestBrandLower && r.brandA.toLowerCase() === adjBrandLower)
          );

          if (isRival) {
            const warn = `⚡ RIVAL BRAND CLASH: '${guest.name}' (${guest.brand}) and '${adjGuest.name}' (${adjGuest.brand}) are rival brands and cannot be seated together! (Seat ${position} and Seat ${adj.position}).`;
            warnings.push({ type: 'brand_clash', message: warn });
            setWarningLogs(prev => [...prev, { id: Date.now() + Math.random(), eventId: selectedEvent.id, type: 'brand_clash', message: warn }]);
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

  // 6. ADMIN MANAGEMENT (Users & Rival Brand Rules)
  const handleAddUser = (userData) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    setUsers([...users, { id: newId, ...userData }]);
  };

  const handleDeleteUser = (userId) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  const handleAddRivalBrand = (brandA, brandB) => {
    const newId = rivalBrands.length > 0 ? Math.max(...rivalBrands.map(r => r.id)) + 1 : 1;
    setRivalBrands([...rivalBrands, { id: newId, brandA, brandB }]);
  };

  const handleDeleteRivalBrand = (rivalId) => {
    setRivalBrands(rivalBrands.filter(r => r.id !== rivalId));
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
                rivalBrands={rivalBrands}
                sections={sections.filter(s => s.eventId === selectedEvent.id)}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onAddRivalBrand={handleAddRivalBrand}
                onDeleteRivalBrand={handleDeleteRivalBrand}
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
