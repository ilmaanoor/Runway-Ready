// App.jsx — Simple Root Component with Pure React State & Hooks (<90 lines)
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GuestList from './components/GuestList';
import SeatingPage from './components/SeatingPage';
import EventReport from './components/EventReport';
import Admin from './components/Admin';
import { get, post, del } from './api';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const evList = await get('/events');
    if (evList && evList.length > 0) {
      setEvents(evList);
      const savedId = localStorage.getItem('rr_event_id');
      const cur = evList.find(e => e.id === Number(savedId)) || evList[0];
      setSelectedEvent(cur);
      loadEventDetails(cur.id);
    }
    const userList = await get('/users');
    if (userList) setUsers(userList);
    const ruleList = await get('/rivals');
    if (ruleList) setRules(ruleList);

    const savedEmail = localStorage.getItem('rr_user_email');
    if (savedEmail && userList) {
      const u = userList.find(x => x.email === savedEmail);
      if (u) setCurrentUser(u);
    }
  };

  const loadEventDetails = async (eventId) => {
    if (!eventId) return;
    const s = await get(`/sections/${eventId}`);
    if (s) setSections(s);
    const g = await get(`/guests/${eventId}`);
    if (g) setGuests(g);
    const a = await get(`/assignments/${eventId}`);
    if (a) setAssignments(a);
  };

  const handleSelectEvent = (ev) => {
    setSelectedEvent(ev);
    localStorage.setItem('rr_event_id', ev.id);
    loadEventDetails(ev.id);
  };

  const handleLogin = (email, password) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('rr_user_email', user.email);
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rr_user_email');
    localStorage.removeItem('rr_event_id');
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-container">
      <Navbar currentUser={currentUser} activePage={activePage} setActivePage={setActivePage} eventsList={events} selectedEvent={selectedEvent} setSelectedEvent={handleSelectEvent} onLogout={handleLogout} />
      <main className="main-content">
        {activePage === 'dashboard' && <Dashboard currentUser={currentUser} events={events} activeSelectedEvent={selectedEvent} onSelectEvent={(ev) => { handleSelectEvent(ev); setActivePage('seating'); }} onAddEvent={async (data) => { await post('/events', data); loadData(); }} onDeleteEvent={async (id) => { await del(`/events/${id}`); loadData(); }} />}
        {activePage === 'guests' && <GuestList selectedEvent={selectedEvent} guests={guests} onAddGuest={async (data) => { await post('/guests', { ...data, event_id: selectedEvent.id }); loadEventDetails(selectedEvent.id); }} onDeleteGuest={async (id) => { await del(`/guests/${id}`); loadEventDetails(selectedEvent.id); }} onToggleCheckin={async (id) => { const g = guests.find(x => x.id === id); await post(`/guests/${id}/checkin`, { checked_in: g && g.checked_in ? 0 : 1 }); loadEventDetails(selectedEvent.id); }} />}
        {activePage === 'seating' && <SeatingPage selectedEvent={selectedEvent} guests={guests} sections={sections} assignments={assignments} separationRules={rules} onAssignSeat={async (gid, sid, pos) => { const res = await post('/assign_seat', { guest_id: gid, section_id: sid, position: pos }); loadEventDetails(selectedEvent.id); return res || { success: true }; }} onUnassignSeat={async (gid) => { await del(`/unassign_seat/${gid}`); loadEventDetails(selectedEvent.id); }} onUpdateSectionCapacity={async (sid, cap) => { await post(`/sections/${sid}/capacity`, { capacity: cap }); loadEventDetails(selectedEvent.id); }} />}
        {activePage === 'report' && <EventReport selectedEvent={selectedEvent} guests={guests} sections={sections} assignments={assignments} />}
        {activePage === 'admin' && <Admin currentUser={currentUser} users={users} separationRules={rules} onAddUser={async (u) => { await post('/users', u); loadData(); }} onDeleteUser={async (id) => { await del(`/users/${id}`); loadData(); }} onAddSeparationRule={async (r) => { await post('/rivals', { brand_a: r.brandA, brand_b: r.brandB }); loadData(); }} onDeleteSeparationRule={async (id) => { await del(`/rivals/${id}`); loadData(); }} />}
      </main>
    </div>
  );
}
