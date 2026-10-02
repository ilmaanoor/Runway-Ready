// RUNWAY READY — Main Application Root Component
// Pure React Application built for Stella Maris College BCA Coursework
// 2-Tier Architecture: Admin (Supervisor) & Event Coordinator (Staff)
// Uses React State Management & Hooks with CRUD Operations

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GuestList from './components/GuestList';
import SeatingPage from './components/SeatingPage';
import Admin from './components/Admin';
import EventReport from './components/EventReport';
import './App.css';

// ==========================================
// SQLITE-ALIGNED INITIAL DATABASE RECORDS
// ==========================================
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
    location: 'https://zoom.us/join', 
    capacity: 500, 
    description: 'Global Digital Livestream & Interactive VR Access' 
  }
];

// INITIAL_SECTIONS: capacities are proportional to each event total capacity
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

// Seating Separation Protocol: pairs of brands with separation guidelines
const INITIAL_SEPARATION = [
  { id: 1, brandA: 'Chanel', brandB: 'Dior' },
  { id: 2, brandA: 'Gucci',  brandB: 'Balenciaga' },
  { id: 3, brandA: 'Prada',  brandB: 'Armani' }
];

export default function App() {
  // =========================================================================
  // REACT STATE MANAGEMENT (Centralized In-Memory Database State)
  // =========================================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('login');
  const [users, setUsers] = useState(INITIAL_USERS);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [guests, setGuests] = useState(INITIAL_GUESTS);
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [seatAssignments, setSeatAssignments] = useState([]);
  const [separationRules, setSeparationRules] = useState(INITIAL_SEPARATION);
  const [warningLogs, setWarningLogs] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(INITIAL_EVENTS[0]);

  // Keep selectedEvent valid if events list updates
  useEffect(() => {
    if (!selectedEvent && events.length > 0) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  // =========================================================================
  // AUTHENTICATION (Login / Logout Handlers)
  // =========================================================================
  const handleLogin = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      setActivePage('dashboard');
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('login');
  };

  // =========================================================================
  // CRUD OPERATIONS: CREATE
  // =========================================================================
  
  // 1. Create Event
  const handleCreateEvent = (eventData) => {
    const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const totalCap = Number(eventData.capacity) || 100;
    
    const newEvent = {
      id: newId,
      name: eventData.name,
      date: eventData.date,
      type: eventData.type,
      location: eventData.location || '',
      capacity: totalCap,
      description: eventData.description || ''
    };

    // Calculate proportional seating sections
    const vipCap = Math.max(1, Math.round(totalCap * 0.20));
    const pressCap = Math.max(1, Math.round(totalCap * 0.20));
    const buyerCap = Math.max(1, Math.round(totalCap * 0.25));
    const generalCap = Math.max(1, totalCap - (vipCap + pressCap + buyerCap));

    const nextSecId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    const isVirtual = eventData.type.toLowerCase() === 'virtual';

    const newSections = [
      {
        id: nextSecId,
        eventId: newId,
        name: isVirtual ? 'VIP Stream Access' : 'Front Row A (VIP)',
        allowed_tier: 'VIP',
        capacity: vipCap
      },
      {
        id: nextSecId + 1,
        eventId: newId,
        name: isVirtual ? 'Press Media Access' : 'Press Row B (Press)',
        allowed_tier: 'Press',
        capacity: pressCap
      },
      {
        id: nextSecId + 2,
        eventId: newId,
        name: isVirtual ? 'Buyer Pass Access' : 'Buyer Lounge C (Buyer)',
        allowed_tier: 'Buyer',
        capacity: buyerCap
      },
      {
        id: nextSecId + 3,
        eventId: newId,
        name: isVirtual ? 'General Audience Stream' : 'General Gallery D',
        allowed_tier: 'General',
        capacity: generalCap
      }
    ];

    setEvents(prev => [...prev, newEvent]);
    setSections(prev => [...prev, ...newSections]);
    setSelectedEvent(newEvent);
    return newEvent;
  };

  // 2. Create / Add Guest
  const handleAddGuest = (guestData) => {
    if (!selectedEvent) return;
    const newId = guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1;
    const newGuest = {
      id: newId,
      eventId: selectedEvent.id,
      name: guestData.name,
      tier: guestData.tier || 'General',
      brand: guestData.brand || 'Independent',
      checked_in: 0
    };
    setGuests(prev => [...prev, newGuest]);
    return newGuest;
  };

  // 3. Create Separation Rule
  const handleAddSeparationRule = (ruleData) => {
    const newId = separationRules.length > 0 ? Math.max(...separationRules.map(r => r.id)) + 1 : 1;
    const newRule = {
      id: newId,
      brandA: ruleData.brandA.trim(),
      brandB: ruleData.brandB.trim()
    };
    setSeparationRules(prev => [...prev, newRule]);
    return newRule;
  };

  // 4. Create / Add User
  const handleAddUser = (userData) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'coordinator'
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  // =========================================================================
  // CRUD OPERATIONS: READ (Selectors & Helpers)
  // =========================================================================
  const eventGuests = guests.filter(g => selectedEvent && g.eventId === selectedEvent.id);
  const eventSections = sections.filter(s => selectedEvent && s.eventId === selectedEvent.id);
  const eventAssignments = seatAssignments.filter(a => {
    const guest = guests.find(g => g.id === a.guestId);
    return guest && selectedEvent && guest.eventId === selectedEvent.id;
  });

  // =========================================================================
  // CRUD OPERATIONS: UPDATE
  // =========================================================================
  
  // 1. Update Check-In Status
  const handleToggleCheckIn = (guestId) => {
    setGuests(prev => prev.map(g => {
      if (g.id === guestId) {
        return { ...g, checked_in: g.checked_in === 1 ? 0 : 1 };
      }
      return g;
    }));
  };

  // 2. Update Seat Assignment with Rule Conflict Detection
  const handleAssignSeat = (guestId, sectionId, position) => {
    const guest = guests.find(g => g.id === guestId);
    const section = sections.find(s => s.id === sectionId);

    if (!guest || !section) return { success: false, error: 'Guest or Section not found' };

    // Validate tier match
    if (section.allowed_tier !== 'General' && section.allowed_tier !== guest.tier) {
      const msg = `Tier Mismatch: ${guest.name} (${guest.tier}) cannot be seated in ${section.name} (Requires ${section.allowed_tier})`;
      setWarningLogs(prev => [{
        id: Date.now(),
        eventId: selectedEvent.id,
        guestId: guest.id,
        type: 'tier_mismatch',
        message: msg
      }, ...prev]);
      return { success: false, error: msg };
    }

    // Check brand separation rules with neighbors
    const leftNeighbor = seatAssignments.find(a => a.sectionId === sectionId && a.position === position - 1);
    const rightNeighbor = seatAssignments.find(a => a.sectionId === sectionId && a.position === position + 1);

    const checkClash = (neighborAssign) => {
      if (!neighborAssign) return null;
      const neighborGuest = guests.find(g => g.id === neighborAssign.guestId);
      if (!neighborGuest || !neighborGuest.brand || !guest.brand) return null;

      const isSeparated = separationRules.some(r =>
        (r.brandA.toLowerCase() === guest.brand.toLowerCase() && r.brandB.toLowerCase() === neighborGuest.brand.toLowerCase()) ||
        (r.brandB.toLowerCase() === guest.brand.toLowerCase() && r.brandA.toLowerCase() === neighborGuest.brand.toLowerCase())
      );

      if (isSeparated) {
        return `Brand Separation Alert: ${guest.name} (${guest.brand}) is adjacent to ${neighborGuest.name} (${neighborGuest.brand}) at Seat #${neighborAssign.position}`;
      }
      return null;
    };

    const leftClash = checkClash(leftNeighbor);
    const rightClash = checkClash(rightNeighbor);
    const clashMsg = leftClash || rightClash;

    if (clashMsg) {
      setWarningLogs(prev => [{
        id: Date.now(),
        eventId: selectedEvent.id,
        guestId: guest.id,
        type: 'brand_clash',
        message: clashMsg
      }, ...prev]);
    }

    // Update assignment list
    setSeatAssignments(prev => {
      const filtered = prev.filter(a => a.guestId !== guestId && !(a.sectionId === sectionId && a.position === position));
      return [...filtered, {
        id: prev.length > 0 ? Math.max(...prev.map(a => a.id)) + 1 : 1,
        guestId: guestId,
        sectionId: sectionId,
        position: position
      }];
    });

    return { success: true, warning: clashMsg };
  };

  // =========================================================================
  // CRUD OPERATIONS: DELETE
  // =========================================================================
  
  // 1. Delete Seat Assignment
  const handleUnassignSeat = (guestId) => {
    setSeatAssignments(prev => prev.filter(a => a.guestId !== guestId));
  };

  // 2. Delete Event (Cascade removes related guests, sections, assignments)
  const handleDeleteEvent = (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setGuests(prev => prev.filter(g => g.eventId !== eventId));
    setSections(prev => prev.filter(s => s.eventId !== eventId));
    setSeatAssignments(prev => prev.filter(a => {
      const g = guests.find(guest => guest.id === a.guestId);
      return g && g.eventId !== eventId;
    }));
    if (selectedEvent && selectedEvent.id === eventId) {
      const remaining = events.filter(e => e.id !== eventId);
      setSelectedEvent(remaining[0] || null);
    }
  };

  // 3. Delete Separation Rule
  const handleDeleteSeparationRule = (ruleId) => {
    setSeparationRules(prev => prev.filter(r => r.id !== ruleId));
  };

  // 4. Delete User
  const handleDeleteUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  // =========================================================================
  // NAVIGATION & VIEW SWITCHING
  // =========================================================================
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Navbar 
        currentUser={currentUser}
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
        events={events}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />

      <main className="main-content">
        {activePage === 'dashboard' && (
          <Dashboard 
            events={events}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            guests={guests}
            sections={sections}
            seatAssignments={seatAssignments}
            onCreateEvent={handleCreateEvent}
            onDeleteEvent={handleDeleteEvent}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'guests' && (
          <GuestList 
            selectedEvent={selectedEvent}
            guests={eventGuests}
            sections={eventSections}
            seatAssignments={eventAssignments}
            onAddGuest={handleAddGuest}
            onToggleCheckIn={handleToggleCheckIn}
            onAssignSeat={handleAssignSeat}
            onUnassignSeat={handleUnassignSeat}
          />
        )}

        {activePage === 'seating' && (
          <SeatingPage 
            selectedEvent={selectedEvent}
            guests={eventGuests}
            sections={eventSections}
            seatAssignments={eventAssignments}
            separationRules={separationRules}
            onAssignSeat={handleAssignSeat}
            onUnassignSeat={handleUnassignSeat}
            warningLogs={warningLogs}
          />
        )}

        {activePage === 'report' && (
          <EventReport 
            selectedEvent={selectedEvent}
            guests={eventGuests}
            sections={eventSections}
            seatAssignments={eventAssignments}
            warningLogs={warningLogs}
          />
        )}

        {activePage === 'admin' && (
          <Admin 
            currentUser={currentUser}
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            separationRules={separationRules}
            onAddRule={handleAddSeparationRule}
            onDeleteRule={handleDeleteSeparationRule}
            warningLogs={warningLogs}
          />
        )}
      </main>
    </div>
  );
}
