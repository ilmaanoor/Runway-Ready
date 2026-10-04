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
// SQLITE BACKEND API CONNECTOR
// ==========================================
const API_BASE = 'http://127.0.0.1:5000/api';

const sendApiRequest = async (endpoint, method = 'POST', data = {}) => {
  try {
    const formData = new FormData();
    let queryParams = '';

    if (data && typeof data === 'object') {
      const pairs = [];
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
          pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
        }
      });
      if (pairs.length > 0) {
        queryParams = '?' + pairs.join('&');
      }
    }

    const url = method === 'DELETE' || method === 'GET'
      ? `${API_BASE}${endpoint}${queryParams}`
      : `${API_BASE}${endpoint}`;

    const options = { method };
    if (method !== 'GET' && method !== 'DELETE') {
      options.body = formData;
    }

    const res = await fetch(url, options);
    if (res && res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    // Graceful offline fallback: local state continues smoothly
    return null;
  }
};

export default function App() {
  // =========================================================================
  // REACT STATE MANAGEMENT (SQLite is source of truth, loaded on startup)
  // =========================================================================
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('login');
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [guests, setGuests] = useState([]);
  const [sections, setSections] = useState([]);
  const [seatAssignments, setSeatAssignments] = useState([]);
  const [separationRules, setSeparationRules] = useState([]);
  const [warningLogs, setWarningLogs] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);



  // Synchronize state with SQLite backend database on initial load
  useEffect(() => {
    const fetchBackendData = async () => {
      setWarningLogs([]);

      const dbEvents = await sendApiRequest('/events', 'GET');
      if (Array.isArray(dbEvents) && dbEvents.length > 0) {
        const formattedEvents = dbEvents.map(e => ({
          id: Number(e.id),
          name: e.name,
          date: e.date,
          type: e.type,
          location: e.location || '',
          capacity: Number(e.capacity) || 100,
          description: e.description || ''
        }));
        setEvents(formattedEvents);

        // Restore selected event using plain localStorage string (just the ID)
        const savedEventId = localStorage.getItem('rr_event_id');
        if (savedEventId) {
          const found = formattedEvents.find(e => e.id === Number(savedEventId));
          setSelectedEvent(found || formattedEvents[0] || null);
        } else {
          setSelectedEvent(formattedEvents[0] || null);
        }

        let allSections = [];
        let allGuests = [];
        let allAssignments = [];

        for (const ev of formattedEvents) {
          const secs = await sendApiRequest(`/sections/${ev.id}`, 'GET');
          if (Array.isArray(secs)) {
            allSections.push(...secs.map(s => ({
              id: Number(s.id),
              eventId: Number(s.event_id),
              name: s.name,
              allowed_tier: s.allowed_tier,
              capacity: Number(s.capacity)
            })));
          }

          const gsts = await sendApiRequest(`/guests/${ev.id}`, 'GET');
          if (Array.isArray(gsts)) {
            allGuests.push(...gsts.map(g => ({
              id: Number(g.id),
              eventId: Number(g.event_id),
              name: g.name,
              tier: g.tier,
              brand: g.brand || '',
              checked_in: Number(g.checked_in) || 0
            })));
          }

          const assg = await sendApiRequest(`/assignments/${ev.id}`, 'GET');
          if (Array.isArray(assg)) {
            allAssignments.push(...assg.map(a => ({
              id: Number(a.id),
              guestId: Number(a.guest_id),
              guest_id: Number(a.guest_id),
              sectionId: Number(a.section_id),
              section_id: Number(a.section_id),
              position: Number(a.position),
              guestName: a.guest_name,
              guestBrand: a.guest_brand,
              guestTier: a.guest_tier,
              sectionName: a.section_name
            })));
          }
        }

        if (allSections.length > 0) setSections(allSections);
        if (allGuests.length > 0) setGuests(allGuests);
        if (allAssignments.length > 0) setSeatAssignments(allAssignments);
      }

      const dbUsers = await sendApiRequest('/users', 'GET');
      if (Array.isArray(dbUsers) && dbUsers.length > 0) {
        const formattedUsers = dbUsers.map(u => ({
          id: Number(u.id),
          name: u.name,
          email: u.email,
          role: u.role,
          password: u.password || (u.role === 'admin' ? 'admin123' : 'staff123')
        }));
        setUsers(formattedUsers);

        // Restore session using plain localStorage strings (no serialization)
        const savedEmail = localStorage.getItem('rr_user_email');
        const savedPage = localStorage.getItem('rr_page');
        if (savedEmail) {
          const foundUser = formattedUsers.find(u => u.email === savedEmail);
          if (foundUser) {
            setCurrentUser(foundUser);
            setActivePage(savedPage || 'dashboard');
          }
        }
      }

      const dbRivals = await sendApiRequest('/rivals', 'GET');
      if (Array.isArray(dbRivals) && dbRivals.length > 0) {
        setSeparationRules(dbRivals.map(r => ({
          id: Number(r.id),
          brandA: r.brand_a,
          brandB: r.brand_b
        })));
      }
    };

    fetchBackendData();
  }, []);

  // Keep selectedEvent valid if events list updates after initial load
  useEffect(() => {
    if (!selectedEvent && events.length > 0) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  // =========================================================================
  // SESSION PERSISTENCE (Plain strings only — no serialization)
  // =========================================================================
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rr_user_email', currentUser.email);
      localStorage.setItem('rr_page', activePage);
    }
  }, [currentUser, activePage]);

  useEffect(() => {
    if (selectedEvent) {
      localStorage.setItem('rr_event_id', String(selectedEvent.id));
    }
  }, [selectedEvent]);

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
    localStorage.removeItem('rr_user_email');
    localStorage.removeItem('rr_page');
    localStorage.removeItem('rr_event_id');
  };



  // =========================================================================
  // CRUD OPERATIONS: CREATE (Syncs to SQLite Database & React State)
  // =========================================================================
  
  // 1. Create Event
  const handleCreateEvent = async (eventData) => {
    const totalCap = Number(eventData.capacity) || 100;
    
    // Sync write directly to SQLite Database
    const res = await sendApiRequest('/events', 'POST', {
      name: eventData.name,
      date: eventData.date,
      type: eventData.type,
      location: eventData.location || '',
      capacity: totalCap,
      description: eventData.description || ''
    });

    const realId = (res && res.id) ? Number(res.id) : (events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1);

    const newEvent = {
      id: realId,
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

    const isVirtual = eventData.type.toLowerCase() === 'virtual';

    // Fetch created sections from backend
    const dbSecs = await sendApiRequest(`/sections/${realId}`, 'GET');
    let newSections = [];
    if (Array.isArray(dbSecs) && dbSecs.length > 0) {
      newSections = dbSecs.map(s => ({
        id: Number(s.id),
        eventId: realId,
        name: s.name,
        allowed_tier: s.allowed_tier,
        capacity: Number(s.capacity)
      }));
    } else {
      const nextSecId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
      newSections = [
        { id: nextSecId, eventId: realId, name: isVirtual ? 'VIP Stream Access' : 'Front Row A (VIP)', allowed_tier: 'VIP', capacity: vipCap },
        { id: nextSecId + 1, eventId: realId, name: isVirtual ? 'Press Media Access' : 'Press Row B (Press)', allowed_tier: 'Press', capacity: pressCap },
        { id: nextSecId + 2, eventId: realId, name: isVirtual ? 'Buyer Pass Access' : 'Buyer Lounge C (Buyer)', allowed_tier: 'Buyer', capacity: buyerCap },
        { id: nextSecId + 3, eventId: realId, name: isVirtual ? 'General Audience Stream' : 'General Gallery D', allowed_tier: 'General', capacity: generalCap }
      ];
    }

    setEvents(prev => [...prev.filter(e => e.id !== realId), newEvent]);
    setSections(prev => [...prev.filter(s => s.eventId !== realId), ...newSections]);
    setSelectedEvent(newEvent);

    return newEvent;
  };

  // Update Section Capacity
  const handleUpdateSectionCapacity = async (sectionId, newCapacity) => {
    const numSecId = Number(sectionId);
    const numCap = Number(newCapacity);
    if (numCap < 1) return;

    setSections(prev => prev.map(s => s.id === numSecId ? { ...s, capacity: numCap } : s));
    await sendApiRequest(`/sections/${numSecId}/capacity`, 'POST', { capacity: numCap });
  };

  // 2. Create / Add Guest
  const handleAddGuest = async (guestData) => {
    if (!selectedEvent) return;
    const tierName = guestData.tier || 'General';

    const res = await sendApiRequest('/guests', 'POST', {
      event_id: selectedEvent.id,
      name: guestData.name,
      tier: tierName,
      brand: guestData.brand || 'Independent'
    });

    const realId = (res && res.id) ? Number(res.id) : (guests.length > 0 ? Math.max(...guests.map(g => g.id)) + 1 : 1);

    const newGuest = {
      id: realId,
      eventId: selectedEvent.id,
      name: guestData.name,
      tier: tierName,
      brand: guestData.brand || 'Independent',
      checked_in: 0
    };
    setGuests(prev => [...prev.filter(g => g.id !== realId), newGuest]);

    // Auto-expand section capacity if guest count in this tier exceeds current section capacity
    const currentTierCount = guests.filter(g => g.eventId === selectedEvent.id && g.tier.toUpperCase() === tierName.toUpperCase()).length + 1;
    const sec = sections.find(s => s.eventId === selectedEvent.id && s.allowed_tier.toUpperCase() === tierName.toUpperCase());
    if (sec && currentTierCount > sec.capacity) {
      handleUpdateSectionCapacity(sec.id, currentTierCount);
    }

    return newGuest;
  };

  // 3. Create Separation Rule
  const handleAddSeparationRule = async (ruleData) => {
    const bA = (ruleData.brandA || '').trim();
    const bB = (ruleData.brandB || '').trim();
    if (!bA || !bB) return;

    const res = await sendApiRequest('/rivals', 'POST', {
      brand_a: bA,
      brand_b: bB
    });

    const realId = (res && res.id) ? Number(res.id) : (separationRules.length > 0 ? Math.max(...separationRules.map(r => r.id)) + 1 : 1);

    const newRule = {
      id: realId,
      brandA: bA,
      brandB: bB
    };

    setSeparationRules(prev => [...prev.filter(r => r.id !== realId), newRule]);

    return newRule;
  };

  // 4. Create / Add User
  const handleAddUser = async (userData) => {
    const res = await sendApiRequest('/users', 'POST', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'coordinator'
    });

    const realId = (res && res.id) ? Number(res.id) : (users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1);

    const newUser = {
      id: realId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || 'coordinator'
    };

    setUsers(prev => [...prev.filter(u => u.id !== realId), newUser]);

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
    if (section.allowed_tier && section.allowed_tier.toUpperCase() !== 'GENERAL' && section.allowed_tier.toUpperCase() !== (guest.tier || '').toUpperCase()) {
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
  const handleDeleteGuest = async (guestId) => {
    const numId = Number(guestId);
    const guestToDelete = guests.find(g => g.id === numId);
    const guestName = guestToDelete ? guestToDelete.name : '';

    setGuests(prev => prev.filter(g => g.id !== numId));
    setSeatAssignments(prev => prev.filter(a => Number(a.guestId || a.guest_id) !== numId));
    await sendApiRequest(`/guests/${numId}`, 'DELETE', { name: guestName });
  };

  // 3. Delete Event (Cascade removes related guests, sections, assignments)
  const handleDeleteEvent = async (eventId) => {
    const numId = Number(eventId);
    const eventToDelete = events.find(e => e.id === numId);
    const eventName = eventToDelete ? eventToDelete.name : '';

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

    await sendApiRequest(`/events/${numId}`, 'DELETE', { name: eventName });
  };

  // 4. Delete Separation Rule
  const handleDeleteSeparationRule = async (ruleId) => {
    const numId = Number(ruleId);
    setSeparationRules(prev => prev.filter(r => r.id !== numId));
    await sendApiRequest(`/rivals/${numId}`, 'DELETE');
  };

  // 5. Delete User
  const handleDeleteUser = async (userId) => {
    const numId = Number(userId);
    setUsers(prev => prev.filter(u => u.id !== numId));
    await sendApiRequest(`/users/${numId}`, 'DELETE');
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
        eventsList={events}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
      />

      <main className="main-content">
        {activePage === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            events={events}
            activeSelectedEvent={selectedEvent}
            onSelectEvent={(ev) => { setSelectedEvent(ev); setActivePage('seating'); }}
            onAddEvent={handleCreateEvent}
            onDeleteEvent={handleDeleteEvent}
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
            onAssignSeat={handleAssignSeat}
            onUnassignSeat={handleUnassignSeat}
            onUpdateSectionCapacity={handleUpdateSectionCapacity}
          />
        )}

        {activePage === 'seating' && (
          <SeatingPage
            selectedEvent={selectedEvent}
            guests={eventGuests}
            sections={eventSections}
            assignments={eventAssignments}
            separationRules={separationRules}
            onAssignSeat={handleAssignSeat}
            onUnassignSeat={handleUnassignSeat}
            onUpdateSectionCapacity={handleUpdateSectionCapacity}
            warningLogs={warningLogs}
          />
        )}

        {activePage === 'report' && (
          <EventReport
            selectedEvent={selectedEvent}
            guests={eventGuests}
            sections={eventSections}
            assignments={eventAssignments}
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
