# ✨ Runway Ready

> **High-Fashion Show Seating & Access Coordination System**  
> A full-stack web application for managing guest seating at physical fashion shows and digital access tiers for virtual shows — powered by a real-time rule engine.

---

## 📌 About the Project

**Runway Ready** is a fashion event management system built as a BCA academic project. It simulates a real-world event coordination platform used by fashion houses to manage VIP guests, press members, buyers, and general attendees — both at physical runway shows and virtual Zoom-based live streams.

The system enforces brand separation rules, tier-based seating protocols, and capacity management automatically, and generates post-event analytics reports for coordinators and administrators.

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Role-Based Login** | Admin and Coordinator roles with different access levels |
| 📅 **Event Management** | Create, view, and delete Physical & Virtual events with full CRUD |
| 👥 **Guest Roster** | Add, remove, and check-in guests with tier and brand assignment |
| 🪑 **Physical Seating** | Interactive runway catwalk grid — click seats to assign/unassign guests |
| 🎥 **Virtual Access Tiers** | Digital pass system for VIP, Press, Buyer, and General stream tiers |
| 🔗 **Zoom Integration** | Join Meeting button opens Zoom test meeting in a new tab |
| ⚠️ **Rule Engine** | Auto-detects brand clashes, tier mismatches, and capacity overflows |
| 📊 **Event Reports** | Post-event analytics — attendance rate, pass utilization, protocol alerts |
| 🚫 **Brand Separation** | Admin-defined rival brand pairs enforced during seating |
| 👤 **User Management** | Admin can add/remove coordinator accounts |
| 💾 **Data Persistence** | All data saved to SQLite database + synced to React state on load |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework — all pages as functional components |
| **Vite** | Build tool and development server |
| **React Hooks** | `useState`, `useEffect` for state and lifecycle management |
| **localStorage** | Client-side persistence across page refreshes |
| **Plain CSS** | Custom high-fashion editorial design system (no Tailwind/Bootstrap) |
| **Google Fonts** | `Playfair Display` (headings) + `Inter` (body) typography |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Python Flask** | Lightweight REST API server |
| **SQLite3** | Embedded relational database (single `.db` file) |
| **Flask CORS** | Cross-origin request handling between React and Flask |

### Database Tables
| Table | Stores |
|-------|--------|
| `events` | Event name, date, type (Physical/Virtual), location, capacity |
| `sections` | 4 sections per event — VIP, Press, Buyer, General with capacities |
| `guests` | Guest name, tier, brand, check-in status |
| `seat_assignments` | Guest-to-section-to-seat mapping |
| `users` | Admin and coordinator login credentials |
| `rival_brands` | Brand separation rules (e.g., Chanel ↔ Dior) |
| `warning_log` | Seating rule violation audit trail |

---

## 📁 Project Structure

```
runway-ready/
├── backend/
│   ├── app.py                  # Flask REST API + SQLite schema & CRUD routes
│   └── runway_ready.db         # SQLite database file
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/             # Fashion editorial images & branding
│   │   ├── components/
│   │   │   ├── Login.jsx       # Page 1 — Authentication & role-based login
│   │   │   ├── Dashboard.jsx   # Page 2 — Event list, creation, selection
│   │   │   ├── GuestList.jsx   # Page 3 — Guest CRUD, check-in toggle
│   │   │   ├── SeatingPage.jsx # Page 4 — Physical runway grid / Virtual pass tiers
│   │   │   ├── EventReport.jsx # Page 5 — Analytics dashboard & alert audit log
│   │   │   ├── Admin.jsx       # Page 6 — User management & brand separation rules
│   │   │   └── Navbar.jsx      # Global navigation with event selector
│   │   ├── App.jsx             # Root component — state management & routing
│   │   ├── App.css             # Full custom fashion editorial CSS design system
│   │   └── main.jsx            # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── run_project.bat             # One-click launcher (starts backend + frontend)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.x** installed
- **Node.js 18+** and npm installed

### 1. Install Backend Dependencies
```bash
cd backend
pip install flask
```

### 2. Run the Backend (Flask)
```bash
cd backend
python app.py
```
> Backend runs on `http://127.0.0.1:5000`

### 3. Install & Run the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
> Frontend runs on `http://localhost:5173`

### ⚡ One-Click Start (Windows)
Double-click `run_project.bat` in the root folder — it starts both backend and frontend automatically.

---

## 🔑 Login Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|-------------|
| **Admin** | `admin@runway.com` | `admin123` | Full access — all pages including Admin Console |
| **Coordinator** | `coordinator@runway.com` | `staff123` | Guest roster, seating, and event reports |

---

## 🗺️ Application Pages

### 1. 🔐 Login
Secure role-based authentication. Validates credentials against the SQLite `users` table.

### 2. 📅 Dashboard
View all events, create new Physical or Virtual shows with capacity, and switch between events using the global event selector in the navbar.

### 3. 👥 Guest List
Add guests with their tier (VIP / Press / Buyer / General) and brand affiliation. Toggle check-in status. Section capacity auto-expands if guests exceed initial allocation.

### 4. 🪑 Seating Arrangement
- **Physical Events** — Visual runway catwalk grid. Click vacant seats to assign guests, click occupied seats to unassign. Brand clash conflicts are highlighted with ⚠️ indicators.
- **Virtual Events** — Digital pass tier columns. Issue passes to guests per tier. Includes Zoom meeting credentials and a Join Meeting button.

### 5. 📊 Event Report
- **Physical** — Attendance rate, non-arrival rate, seating protocol alerts log
- **Virtual** — Livestream pass utilization rate, active viewer count, verified digital pass registry

### 6. ⚙️ Admin Console *(Admin only)*
Manage coordinator accounts (add/delete users) and define brand separation rules that the seating rule engine enforces automatically.

---

## ⚙️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/login` | Authenticate user |
| `GET` | `/api/events` | Get all events |
| `POST` | `/api/events` | Create event + auto-generate 4 sections |
| `DELETE` | `/api/events/<id>` | Delete event (cascade) |
| `GET` | `/api/guests/<event_id>` | Get guests for event |
| `POST` | `/api/guests` | Add guest |
| `DELETE` | `/api/guests/<id>` | Remove guest |
| `POST` | `/api/guests/<id>/checkin` | Toggle check-in status |
| `GET` | `/api/sections/<event_id>` | Get sections for event |
| `POST` | `/api/sections/<id>/capacity` | Update section capacity |
| `GET` | `/api/assignments/<event_id>` | Get seat assignments |
| `POST` | `/api/assign_seat` | Assign guest to seat (runs rule engine) |
| `DELETE` | `/api/unassign_seat/<guest_id>` | Remove seat assignment |
| `GET` | `/api/rivals` | Get brand separation rules |
| `POST` | `/api/rivals` | Add separation rule |
| `DELETE` | `/api/rivals/<id>` | Remove separation rule |
| `GET` | `/api/users` | Get all users |
| `POST` | `/api/users` | Add user |
| `DELETE` | `/api/users/<id>` | Delete user |
| `GET` | `/api/report/<event_id>` | Get event analytics report |

---

## 🧠 Rule Engine Logic

When assigning a guest to a seat, the backend automatically checks:

1. **Tier Mismatch** — Guest's tier must match the section's allowed tier (e.g., VIP guests only in VIP section)
2. **Brand Separation** — Adjacent seats cannot have guests from rival brand pairs (defined in Admin Console)
3. **Capacity Auto-Expand** — If the number of guests in a tier exceeds a section's capacity, the capacity auto-expands to accommodate all guests

All violations are logged to the `warning_log` table and displayed in the Event Report's Protocol Alert Log.

---

## 👩‍💻 Built By

**Ilmaa Noor** — BCA Academic Project  
GitHub: [@ilmaanoor](https://github.com/ilmaanoor)
