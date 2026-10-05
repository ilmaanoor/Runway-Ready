# db.py — Simple SQLite Database Configuration & Schema
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'runway_ready.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT)')
    c.execute('CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, date TEXT, type TEXT, location TEXT, capacity INTEGER, description TEXT)')
    c.execute('CREATE TABLE IF NOT EXISTS guests (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER, name TEXT, tier TEXT, brand TEXT, checked_in INTEGER DEFAULT 0)')
    c.execute('CREATE TABLE IF NOT EXISTS sections (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER, name TEXT, allowed_tier TEXT, capacity INTEGER)')
    c.execute('CREATE TABLE IF NOT EXISTS seat_assignments (id INTEGER PRIMARY KEY AUTOINCREMENT, guest_id INTEGER, section_id INTEGER, position INTEGER)')
    c.execute('CREATE TABLE IF NOT EXISTS rival_brands (id INTEGER PRIMARY KEY AUTOINCREMENT, brand_a TEXT, brand_b TEXT)')
    c.execute('CREATE TABLE IF NOT EXISTS warning_log (id INTEGER PRIMARY KEY AUTOINCREMENT, event_id INTEGER, guest_id INTEGER, type TEXT, message TEXT)')
    
    # Seed default accounts if empty
    c.execute('SELECT COUNT(*) as count FROM users')
    if c.fetchone()['count'] == 0:
        c.execute("INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@runway.com', 'admin123', 'admin'), ('Coordinator', 'coordinator@runway.com', 'staff123', 'coordinator')")
        c.execute("INSERT INTO events (name, date, type, location, capacity, description) VALUES ('Milan Haute Couture Gala 2027', '2027-05-15', 'Physical', 'Palazzo Reale, Milan', 200, 'Milan Fashion Week Showcase')")
        eid = c.lastrowid
        c.execute("INSERT INTO sections (event_id, name, allowed_tier, capacity) VALUES (?, 'Front Row A (VIP)', 'VIP', 40), (?, 'Press Box B', 'Press', 40), (?, 'Buyer Lounge C', 'Buyer', 50), (?, 'General Gallery D', 'General', 70)", (eid, eid, eid, eid))
        c.execute("INSERT INTO rival_brands (brand_a, brand_b) VALUES ('Chanel', 'Dior'), ('Gucci', 'Prada')")
    
    conn.commit()
    conn.close()
