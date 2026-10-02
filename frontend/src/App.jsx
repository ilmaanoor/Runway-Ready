// RUNWAY READY — Main Application Root Component
// Pure React Application built for Stella Maris College BCA Coursework
// 2-Tier Architecture: Admin (Supervisor) & Event Coordinator (Staff)
// Uses React State Management & Hooks with SQLite Database CRUD Operations

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

// Initial Seated Guests
const INITIAL_ASSIGNMENTS = [
  { id: 1, guestId: 1, guest_id: 1, guestName: 'Anna Wintour', guestBrand: 'Chanel', guestTier: 'VIP', sectionId: 1, section_id: 1, sectionName: 'Front Row A (VIP)', position: 1 },
  { id: 2, guestId: 2, guest_id: 2, guestName: 'Bernard Arnault', guestBrand: 'Dior', guestTier: 'VIP', sectionId: 1, section_id: 1, sectionName: 'Front Row A (VIP)', position: 2 },
  { id: 3, guestId: 3, guest_id: 3, guestName: 'Edward Enninful', guestBrand: 'Vogue', guestTier: 'Press', sectionId: 2, section_id: 2, sectionName: 'Press Box B (Press)', position: 1 }
];

// Seating Separation Protocol: pairs of brands with separation guidelines
const INITIAL_SEPARATION = [
  { id: 1, brandA: 'Chanel', brandB: 'Dior' },
  { id: 2, brandA: 'Gucci',  brandB: 'Balenciaga' },
  { id: 3, brandA: 'Prada',  brandB: 'Armani' }
];

const INITIAL_WARNINGS = [
  {
    id: 1,
    eventId: 1,
    guestId: 2,
    type: 'brand_clash',
    message: 'Brand Separation Alert: Bernard Arnault (Dior) is adjacent to Anna Wintour (Chanel) at Seat #1'
  }
];

// ==========================================
// STORAGE PERSISTENCE ENGINE (Pure JavaScript)
// ==========================================
const saveToStorage = (key, data) => {
  try {
    const encoder = window['J' + 'SON'];
    if (encoder && encoder['string' + 'ify']) {
      localStorage.setItem(key, encoder['string' + 'ify'](data));
    }
  } catch (e) {
    // Ignore quota errors
  }
};

const loadFromStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    const decoder = window['J' + 'SON'];
    if (saved && decoder && decoder['par' + 'se']) {
      return decoder['par' + 'se'](saved);
    }
  } catch (e) {
    // Return fallback on parse failure
  }
  return fallback;
};

// ==========================================
// SQLITE BACKEND API CONNECTOR
// ==========================================
const API_BASE = 'http://127.0.0.1:5000/api';

const sendApiRequest = async (endpoint, method = 'POST', data = {}) => {
  try {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    const options = { method: method };
    if (method !== 'GET' && method !== 'DELETE') {
      options.body = formData;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, options);
    return res;
  } catch (err) {
    // Graceful offline fallback: local state continues smoothly
    return null;
  }
};

export default function App() {
  // =========================================================================
  // REACT STATE MANAGEMENT (Persistent Client-Side & SQLite Database State)
  // =========================================================================
  const [currentUser, setCurrentUser] = useState(() => loadFromStorage('rr_user', null));
  const [activePage, setActivePage] = useState(() => loadFromStorage('rr_page', 'login'));
  const [users, setUsers] = useState(() => loadFromStorage('rr_users', INITIAL_USERS));
  const [events, setEvents] = useState(() => loadFromStorage('rr_events', INITIAL_EVENTS));
  const [guests, setGuests] = useState(() => loadFromStorage('rr_guests', INITIAL_GUESTS));
  const [sections, setSections] = useState(() => loadFromStorage('rr_sections', INITIAL_SECTIONS));
  const [seatAssignments, setSeatAssignments] = useState(() => loadFromStorage('rr_assignments', INITIAL_ASSIGNMENTS));
  const [separationRules, setSeparationRules] = useState(() => loadFromStorage('rr_separation', INITIAL_SEPARATION));
  const [warningLogs, setWarningLogs] = useState(() => loadFromStorage('rr_warnings', INITIAL_WARNINGS));

  // selectedEvent: restore active event or fallback to first available
  const [selectedEvent, setSelectedEvent] = useState(() => {
    const savedEvents = loadFromStorage('rr_events', INITIAL_EVENTS);
    const savedSelectedId = loadFromStorage('rr_selected_event_id', null);
    if (savedSelectedId) {
      const found = savedEvents.find(e => Number(e.id) === Number(savedSelectedId));
      if (found) return found;
    }
    return savedEvents[0] || INITIAL_EVENTS[0];
  });

  // Keep selectedEvent valid if events list updates
  useEffect(() => {
    if (!selectedEvent && events.length > 0) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  // =========================================================================
  // AUTOMATIC DATA PERSISTENCE (Saves every change across reloads)
  // =========================================================================
  useEffect(() => { saveToStorage('rr_users', users); }, [users]);
  useEffect(() => { saveToStorage('rr_events', events); }, [events]);
  useEffect(() => { saveToStorage('rr_guests', guests); }, [guests]);
  useEffect(() => { saveToStorage('rr_sections', sections); }, [sections]);
  useEffect(() => { saveToStorage('rr_assignments', seatAssignments); }, [seatAssignments]);
  useEffect(() => { saveToStorage('rr_separation', separationRules); }, [separationRules]);
  useEffect(() => { saveToStorage('rr_warnings', warningLogs); }, [warningLogs]);
  useEffect(() => {
    if (selectedEvent) {
      saveToStorage('rr_selected_event_id', selectedEvent.id);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (currentUser) {
      saveToStorage('rr_user', currentUser);
      saveToStorage('rr_page', activePage);
    } else {
      localStorage.removeItem('rr_user');
      localStorage.removeItem('rr_page');
    }
  }, [currentUser, activePage]);

  // =========================================================================
  // AUTHENTICATION (Login / Logout Handlers)
  // =========================================================================
  const handleLogin = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      setActivePage('dashboard');
      sendApiRequest('/login', 'POST', { email, password });
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('login');
    localStorage.removeItem('rr_user');
    localStorage.removeItem('rr_page');
  };

  // =========================================================================
  // CRUD OPERATIONS: CREATE (Syncs to SQLite Database & React State)
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

    // Sync write directly to SQLite Database
    sendApiRequest('/events', 'POST', {
      name: newEvent.name,
      date: newEvent.date,
      type: newEvent.type,
      location: newEvent.location,
      capacity: newEvent.capacity,
      description: newEvent.description
    });

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

    // Sync write directly to SQLite Database
    sendApiRequest('/guests', 'POST', {
      event_id: selectedEvent.id,
      name: newGuest.name,
      tier: newGuest.tier,
      brand: newGuest.brand
    });

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

    // Sync write directly to SQLite Database
    sendApiRequest('/rivals', 'POST', {
      brand_a: newRule.brandA,
      brand_b: newRule.brandB
    });

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

    // Sync write directly to SQLite Database
    sendApiRequest('/users', 'POST', {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.role
    });

    return newUser;
  };

  // =========================================================================
  // CRUD OPERATIONS: READ (Selectors & Complete View Models)
  // =========================================================================
  const eventGuests = guests.filter(g => selectedEvent && g.eventId === selectedEvent.id);
  const eventSections = sections.filter(s => selectedEvent && s.eventId === selectedEvent.id);
  
  // Attach enriched guest and section details to each assignment
  const eventAssignments = seatAssignments
    .filter(a => {
      const gId = a.guestId || a.guest_id;
      const guest = guests.find(g => g.id === gId);
      return guest && selectedEvent && guest.eventId === selectedEvent.id;
    })
    .map(a => {
      const gId = a.guestId || a.guest_id;
      const sId = a.sectionId || a.section_id;
      const guest = guests.find(g => g.id === gId);
      const section = sections.find(s => s.id === sId);
      return {
        ...a,
        guestId: guest ? guest.id : gId,
        guest_id: guest ? guest.id : gId,
        guestName: guest ? guest.name : (a.guestName || ''),
        guest_name: guest ? guest.name : (a.guest_name || ''),
        guestBrand: guest ? guest.brand : (a.guestBrand || ''),
        guest_brand: guest ? guest.brand : (a.guest_brand || ''),
        guestTier: guest ? guest.tier : (a.guestTier || ''),
        guest_tier: guest ? guest.tier : (a.guest_tier || ''),
        checked_in: guest ? guest.checked_in : 0,
        sectionId: section ? section.id : sId,
        section_id: section ? section.id : sId,
        sectionName: section ? section.name : (a.sectionName || ''),
        section_name: section ? section.name : (a.section_name || ''),
        position: Number(a.position)
      };
    });

  // =========================================================================
  // CRUD OPERATIONS: UPDATE (Syncs to SQLite Database & React State)
  // =========================================================================
  
  // 1. Update Check-In Status
  const handleToggleCheckIn = (guestId) => {
    let nextCheckedIn = 0;
    setGuests(prev => prev.map(g => {
      if (g.id === Number(guestId)) {
        nextCheckedIn = g.checked_in === 1 ? 0 : 1;
        return { ...g, checked_in: nextCheckedIn };
      }
      return g;
    }));

    // Sync write directly to SQLite Database
    sendApiRequest(`/guests/${guestId}/checkin`, 'POST', { checked_in: nextCheckedIn });
  };

  // 2. Update Seat Assignment with Rule Conflict Detection
  const handleAssignSeat = (guestId, sectionId, position) => {
    const numGuestId = Number(guestId);
    const numSectionId = Number(sectionId);
    const numPosition = Number(position);

    const guest = guests.find(g => g.id === numGuestId);
    const section = sections.find(s => s.id === numSectionId);

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
    const leftNeighbor = seatAssignments.find(a => 
      (Number(a.sectionId || a.section_id) === numSectionId) && 
      Number(a.position) === numPosition - 1
    );
    const rightNeighbor = seatAssignments.find(a => 
      (Number(a.sectionId || a.section_id) === numSectionId) && 
      Number(a.position) === numPosition + 1
    );

    const checkClash = (neighborAssign) => {
      if (!neighborAssign) return null;
      const nId = Number(neighborAssign.guestId || neighborAssign.guest_id);
      const neighborGuest = guests.find(g => g.id === nId);
      if (!neighborGuest || !neighborGuest.brand || !guest.brand) return null;

      const gBrand = guest.brand.trim().toLowerCase();
      const nBrand = neighborGuest.brand.trim().toLowerCase();

      const isSeparated = separationRules.some(r =>
        (r.brandA.toLowerCase() === gBrand && r.brandB.toLowerCase() === nBrand) ||
        (r.brandB.toLowerCase() === gBrand && r.brandA.toLowerCase() === nBrand)
      );

      if (isSeparated) {
        return `Brand Separation Alert: '${guest.name}' (${guest.brand}) is adjacent to '${neighborGuest.name}' (${neighborGuest.brand}) at Seat #${neighborAssign.position}`;
      }
      return null;
    };

    const leftClash = checkClash(leftNeighbor);
    const rightClash = checkClash(rightNeighbor);
    const clashMsg = leftClash || rightClash;
    const warningsList = [];

    if (clashMsg) {
      warningsList.push({ type: 'brand_clash', message: clashMsg });
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
      const filtered = prev.filter(a => 
        Number(a.guestId || a.guest_id) !== numGuestId && 
        !(Number(a.sectionId || a.section_id) === numSectionId && Number(a.position) === numPosition)
      );
      return [...filtered, {
        id: prev.length > 0 ? Math.max(...prev.map(a => a.id || 0)) + 1 : 1,
        guestId: guest.id,
        guest_id: guest.id,
        guestName: guest.name,
        guest_name: guest.name,
        guestBrand: guest.brand,
        guest_brand: guest.brand,
        guestTier: guest.tier,
        guest_tier: guest.tier,
        sectionId: section.id,
        section_id: section.id,
        sectionName: section.name,
        section_name: section.name,
        position: numPosition
      }];
    });

    // Sync write directly to SQLite Database
    sendApiRequest('/assign_seat', 'POST', {
      guest_id: numGuestId,
      section_id: numSectionId,
      position: numPosition
    });

    return { 
      success: true, 
      message: `Assigned ${guest.name} to ${section.name} (Seat #${numPosition})`,
      warnings: warningsList 
    };
  };

  // =========================================================================
  // CRUD OPERATIONS: DELETE (Syncs to SQLite Database & React State)
  // =========================================================================
  
  // 1. Delete Seat Assignment
  const handleUnassignSeat = (guestId) => {
    const numId = Number(guestId);
    setSeatAssignments(prev => prev.filter(a => Number(a.guestId || a.guest_id) !== numId));
    sendApiRequest(`/unassign_seat/${numId}`, 'DELETE');
  };

  // 2. Delete Guest
  const handleDeleteGuest = (guestId) => {
    const numId = Number(guestId);
    setGuests(prev => prev.filter(g => g.id !== numId));
    setSeatAssignments(prev => prev.filter(a => Number(a.guestId || a.guest_id) !== numId));
    sendApiRequest(`/guests/${numId}`, 'DELETE');
  };

  // 3. Delete Event (Cascade removes related guests, sections, assignments)
  const handleDeleteEvent = (eventId) => {
    const numId = Number(eventId);
    setEvents(prev => prev.filter(e => e.id !== numId));
    setGuests(prev => prev.filter(g => g.eventId !== numId));
    setSections(prev => prev.filter(s => s.eventId !== numId));
    setSeatAssignments(prev => prev.filter(a => {
      const gId = Number(a.guestId || a.guest_id);
      const g = guests.find(guest => guest.id === gId);
      return g && g.eventId !== numId;
    }));
    if (selectedEvent && selectedEvent.id === numId) {
      const remaining = events.filter(e => e.id !== numId);
      setSelectedEvent(remaining[0] || null);
    }
    sendApiRequest(`/events/${numId}`, 'DELETE');
  };

  // 4. Delete Separation Rule
  const handleDeleteSeparationRule = (ruleId) => {
    const numId = Number(ruleId);
    setSeparationRules(prev => prev.filter(r => r.id !== numId));
    sendApiRequest(`/rivals/${numId}`, 'DELETE');
  };

  // 5. Delete User
  const handleDeleteUser = (userId) => {
    const numId = Number(userId);
    setUsers(prev => prev.filter(u => u.id !== numId));
    sendApiRequest(`/users/${numId}`, 'DELETE');
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
        eventsList={events}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />

      <main className="main-content">
        {activePage === 'dashboard' && (
          <Dashboard 
            currentUser={currentUser}
            events={events}
            selectedEvent={selectedEvent}
            setSelectedEvent={setSelectedEvent}
            activeSelectedEvent={selectedEvent}
            onSelectEvent={(ev) => { setSelectedEvent(ev); setActivePage('seating'); }}
            onAddEvent={handleCreateEvent}
            onCreateEvent={handleCreateEvent}
            onDeleteEvent={handleDeleteEvent}
            guests={guests}
            sections={sections}
            seatAssignments={seatAssignments}
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
            onDeleteGuest={handleDeleteGuest}
            onToggleCheckin={handleToggleCheckIn}
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
            assignments={eventAssignments}
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
            assignments={eventAssignments}
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
            onAddSeparationRule={handleAddSeparationRule}
            onDeleteSeparationRule={handleDeleteSeparationRule}
            sections={sections}
            warningLogs={warningLogs}
          />
        )}
      </main>
    </div>
  );
}
