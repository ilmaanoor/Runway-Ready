# Runway Ready 👠

> High-Fashion Show Seating & Access Coordination System with Real-Time Rule Engine

Runway Ready is a web application designed to manage guest seating for physical fashion shows and stream access tiers for virtual shows from a single system. It includes an automated rule-engine that prevents seating conflicts (tier mismatches, brand clashes between rivals, and section capacity overflows) and generates post-event analytical reports.

---

## 🛠️ Tech Stack

- **Frontend**: React (Plain JavaScript, Functional Components, `useState`, `useEffect`, `fetch`)
- **Backend**: Python Flask REST API
- **Database**: SQLite (direct database execution, single local `.db` file)
- **Styling**: High-Fashion Tech Editorial CSS (`Playfair Display` + `Inter` typography)

---

## 📦 Project Structure

```
runway-ready/
├── backend/
│   ├── app.py              # Flask server + SQLite schema & REST endpoints
│   └── runway_ready.db     # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Header with global event selector & role checks
│   │   │   ├── Login.jsx       # Page 1: Login & authentication
│   │   │   ├── Dashboard.jsx   # Page 2: Show list & event creation
│   │   │   ├── GuestList.jsx   # Page 3: Guest roster CRUD & check-in toggle
│   │   │   ├── SeatingPage.jsx # Page 4: Interactive runway grid / 3-column virtual tiers
│   │   │   ├── Admin.jsx       # Page 5: Team members, rival brands, capacity limits
│   │   │   └── EventReport.jsx # Page 6: Executive analytics & conflict log audit
│   │   ├── App.jsx             # Main application state & conditional rendering
│   │   └── App.css             # High-Fashion Tech CSS Design System
│   ├── index.html
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Run Backend Server (Flask)
```bash
cd backend
python app.py
```
*Backend runs locally on `http://127.0.0.1:5000`.*

### 2. Run Frontend App (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs locally on `http://127.0.0.1:5173`.*

---

## 🔑 Demo Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@runway.com` | `admin123` | Full Access (including Admin Console) |
| **PR Team** | `pr@runway.com` | `pr123` | Guest Roster & Seating |
| **Venue Team** | `venue@runway.com` | `venue123` | Guest Roster & Seating |
