import sqlite3
import os
from flask import Flask, request

app = Flask(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), 'runway_ready.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    ''')

    # Create events table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            location TEXT DEFAULT '',
            capacity INTEGER DEFAULT 100,
            description TEXT DEFAULT ''
        )
    ''')

    # Create guests table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS guests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            tier TEXT NOT NULL,
            brand TEXT,
            checked_in INTEGER DEFAULT 0,
            FOREIGN KEY (event_id) REFERENCES events(id)
        )
    ''')

    # Create sections table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            allowed_tier TEXT NOT NULL,
            capacity INTEGER NOT NULL,
            FOREIGN KEY (event_id) REFERENCES events(id)
        )
    ''')

    # Create seat_assignments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS seat_assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guest_id INTEGER NOT NULL,
            section_id INTEGER NOT NULL,
            position INTEGER NOT NULL,
            FOREIGN KEY (guest_id) REFERENCES guests(id),
            FOREIGN KEY (section_id) REFERENCES sections(id)
        )
    ''')

    # Create rival_brands / separation table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rival_brands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand_a TEXT NOT NULL,
            brand_b TEXT NOT NULL
        )
    ''')

    # Create warning_log table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS warning_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            guest_id INTEGER,
            type TEXT NOT NULL,
            message TEXT,
            FOREIGN KEY (event_id) REFERENCES events(id)
        )
    ''')

    # Seed default users if none exist
    cursor.execute('SELECT COUNT(*) as count FROM users')
    if cursor.fetchone()['count'] == 0:
        cursor.execute('''
            INSERT INTO users (name, email, password, role)
            VALUES 
                ('Admin User', 'admin@runway.com', 'admin123', 'admin'),
                ('Event Coordinator', 'coordinator@runway.com', 'staff123', 'coordinator')
        ''')
        
        # Seed default event
        cursor.execute('''
            INSERT INTO events (name, date, type, location, capacity, description)
            VALUES ('Milan Haute Couture Gala 2027', '2027-05-15', 'Physical', 'Palazzo Reale, Milan', 200, 'Annual Milan Fashion Week Showcase')
        ''')
        event_id = cursor.lastrowid
        
        # Seed default sections
        cursor.execute('''
            INSERT INTO sections (event_id, name, allowed_tier, capacity)
            VALUES 
                (?, 'Front Row A (VIP)', 'VIP', 40),
                (?, 'Press Box B (Press)', 'Press', 40),
                (?, 'Buyer Lounge C (Buyer)', 'Buyer', 50),
                (?, 'General Gallery D', 'General', 70)
        ''', (event_id, event_id, event_id, event_id))

        # Seed sample separation rules
        cursor.execute('''
            INSERT INTO rival_brands (brand_a, brand_b)
            VALUES 
                ('Chanel', 'Dior'),
                ('Gucci', 'Balenciaga'),
                ('Prada', 'Armani')
        ''')

        # Seed sample guests
        cursor.execute('''
            INSERT INTO guests (event_id, name, tier, brand, checked_in)
            VALUES 
                (?, 'Anna Wintour', 'VIP', 'Chanel', 1),
                (?, 'Bernard Arnault', 'VIP', 'Dior', 0),
                (?, 'Edward Enninful', 'Press', 'Vogue', 1),
                (?, 'Hailey Bieber', 'General', 'Independent', 0),
                (?, 'Milan Retail Buyer', 'Buyer', 'Prada', 0)
        ''', (event_id, event_id, event_id, event_id, event_id))

    conn.commit()
    conn.close()

# Manual CORS setup helper
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# Standard OPTIONS handle for CORS preflight
@app.route('/<path:dummy>', methods=['OPTIONS'])
@app.route('/', methods=['OPTIONS'])
def options_handler(dummy=None):
    return {'status': 'ok'}, 200

# ==================== USERS CRUD ROUTES ====================
@app.route('/api/login', methods=['POST'])
def login():
    data = dict(request.form or request.values)
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    conn = get_db_connection()
    user = conn.execute('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()
    conn.close()

    if user:
        return {'success': True, 'user': dict(user)}
    else:
        return {'success': False, 'message': 'Invalid email or password'}, 401

@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    users = conn.execute('SELECT id, name, email, role FROM users').fetchall()
    conn.close()
    return [dict(u) for u in users]

@app.route('/api/users', methods=['POST'])
def add_user():
    data = dict(request.form or request.values)
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    role = data.get('role', 'coordinator').strip()

    if not name or not email or not password:
        return {'error': 'Name, email, and password are required'}, 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                       (name, email, password, role))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return {'id': user_id, 'name': name, 'email': email, 'role': role}, 201
    except sqlite3.IntegrityError:
        return {'error': 'Email already exists'}, 400

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    return {'success': True}

# ==================== EVENTS CRUD ROUTES ====================
@app.route('/api/events', methods=['GET'])
def get_events():
    conn = get_db_connection()
    events = conn.execute('SELECT * FROM events ORDER BY id DESC').fetchall()
    conn.close()
    return [dict(e) for e in events]

@app.route('/api/events', methods=['POST'])
def add_event():
    data = dict(request.form or request.values)
    name = data.get('name', '').strip()
    date = data.get('date', '').strip()
    type_ = data.get('type', 'Physical').strip()
    location = data.get('location', '').strip()
    capacity = int(data.get('capacity', 100) or 100)
    description = data.get('description', '').strip()

    if not name or not date:
        return {'error': 'Event name and date are required'}, 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO events (name, date, type, location, capacity, description) 
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (name, date, type_, location, capacity, description))
    event_id = cursor.lastrowid

    # Calculate proportional seating
    vip_cap = max(1, round(capacity * 0.20))
    press_cap = max(1, round(capacity * 0.20))
    buyer_cap = max(1, round(capacity * 0.25))
    general_cap = max(1, capacity - (vip_cap + press_cap + buyer_cap))

    is_virtual = type_.lower() == 'virtual'
    cursor.execute('''
        INSERT INTO sections (event_id, name, allowed_tier, capacity)
        VALUES 
            (?, ?, 'VIP', ?),
            (?, ?, 'Press', ?),
            (?, ?, 'Buyer', ?),
            (?, ?, 'General', ?)
    ''', (
        event_id, 'VIP Stream Access' if is_virtual else 'Front Row A (VIP)', vip_cap,
        event_id, 'Press Media Access' if is_virtual else 'Press Row B (Press)', press_cap,
        event_id, 'Buyer Pass Access' if is_virtual else 'Buyer Lounge C (Buyer)', buyer_cap,
        event_id, 'General Audience Stream' if is_virtual else 'General Gallery D', general_cap
    ))

    conn.commit()
    conn.close()

    return {'id': event_id, 'name': name, 'date': date, 'type': type_}, 201

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM seat_assignments WHERE guest_id IN (SELECT id FROM guests WHERE event_id = ?)', (event_id,))
    cursor.execute('DELETE FROM warning_log WHERE event_id = ?', (event_id,))
    cursor.execute('DELETE FROM guests WHERE event_id = ?', (event_id,))
    cursor.execute('DELETE FROM sections WHERE event_id = ?', (event_id,))
    cursor.execute('DELETE FROM events WHERE id = ?', (event_id,))
    conn.commit()
    conn.close()
    return {'success': True}

# ==================== GUESTS CRUD ROUTES ====================
@app.route('/api/guests/<int:event_id>', methods=['GET'])
def get_guests(event_id):
    conn = get_db_connection()
    guests = conn.execute('SELECT * FROM guests WHERE event_id = ?', (event_id,)).fetchall()
    conn.close()
    return [dict(g) for g in guests]

@app.route('/api/guests', methods=['POST'])
def add_guest():
    data = dict(request.form or request.values)
    event_id = data.get('event_id')
    name = data.get('name', '').strip()
    tier = data.get('tier', 'General').strip()
    brand = data.get('brand', 'Independent').strip()

    if not event_id or not name:
        return {'error': 'Event ID and Name are required'}, 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO guests (event_id, name, tier, brand, checked_in) VALUES (?, ?, ?, ?, 0)',
                   (event_id, name, tier, brand))
    guest_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {'id': guest_id, 'event_id': event_id, 'name': name, 'tier': tier, 'brand': brand, 'checked_in': 0}, 201

@app.route('/api/guests/<int:guest_id>', methods=['DELETE'])
def delete_guest(guest_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM seat_assignments WHERE guest_id = ?', (guest_id,))
    conn.execute('DELETE FROM guests WHERE id = ?', (guest_id,))
    conn.commit()
    conn.close()
    return {'success': True}

@app.route('/api/guests/<int:guest_id>/checkin', methods=['POST'])
def toggle_checkin(guest_id):
    data = dict(request.form or request.values)
    checked_in = int(data.get('checked_in', 1))

    conn = get_db_connection()
    conn.execute('UPDATE guests SET checked_in = ? WHERE id = ?', (checked_in, guest_id))
    conn.commit()
    conn.close()
    return {'success': True, 'checked_in': checked_in}

# ==================== SECTIONS CRUD ROUTES ====================
@app.route('/api/sections/<int:event_id>', methods=['GET'])
def get_sections(event_id):
    conn = get_db_connection()
    sections = conn.execute('SELECT * FROM sections WHERE event_id = ?', (event_id,)).fetchall()
    conn.close()
    return [dict(s) for s in sections]

# ==================== SEPARATION RULES CRUD ROUTES ====================
@app.route('/api/rivals', methods=['GET'])
def get_rivals():
    conn = get_db_connection()
    rivals = conn.execute('SELECT * FROM rival_brands').fetchall()
    conn.close()
    return [dict(r) for r in rivals]

@app.route('/api/rivals', methods=['POST'])
def add_rival():
    data = dict(request.form or request.values)
    brand_a = data.get('brand_a', '').strip()
    brand_b = data.get('brand_b', '').strip()

    if not brand_a or not brand_b:
        return {'error': 'Both brand names are required'}, 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO rival_brands (brand_a, brand_b) VALUES (?, ?)', (brand_a, brand_b))
    rival_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {'id': rival_id, 'brand_a': brand_a, 'brand_b': brand_b}, 201

@app.route('/api/rivals/<int:rival_id>', methods=['DELETE'])
def delete_rival(rival_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM rival_brands WHERE id = ?', (rival_id,))
    conn.commit()
    conn.close()
    return {'success': True}

# ==================== SEAT ASSIGNMENTS & RULES ENGINE ====================
@app.route('/api/assignments/<int:event_id>', methods=['GET'])
def get_assignments(event_id):
    conn = get_db_connection()
    query = '''
        SELECT sa.id, sa.guest_id, sa.section_id, sa.position,
               g.name as guest_name, g.tier as guest_tier, g.brand as guest_brand, g.checked_in,
               s.name as section_name, s.allowed_tier, s.capacity
        FROM seat_assignments sa
        JOIN guests g ON sa.guest_id = g.id
        JOIN sections s ON sa.section_id = s.id
        WHERE g.event_id = ?
    '''
    assignments = conn.execute(query, (event_id,)).fetchall()
    conn.close()
    return [dict(a) for a in assignments]

@app.route('/api/assign_seat', methods=['POST'])
def assign_seat():
    data = dict(request.form or request.values)
    guest_id = data.get('guest_id')
    section_id = data.get('section_id')
    position = int(data.get('position', 1))

    if not guest_id or not section_id:
        return {'error': 'guest_id and section_id are required'}, 400

    conn = get_db_connection()
    cursor = conn.cursor()

    guest = cursor.execute('SELECT * FROM guests WHERE id = ?', (guest_id,)).fetchone()
    section = cursor.execute('SELECT * FROM sections WHERE id = ?', (section_id,)).fetchone()

    if not guest or not section:
        conn.close()
        return {'error': 'Guest or Section not found'}, 404

    event_id = guest['event_id']
    warnings = []

    # 1. Tier compatibility validation
    if section['allowed_tier'] != 'General' and section['allowed_tier'] != guest['tier']:
        err_msg = f"Tier Mismatch: {guest['name']} ({guest['tier']}) cannot sit in {section['name']} ({section['allowed_tier']})"
        cursor.execute('INSERT INTO warning_log (event_id, guest_id, type, message) VALUES (?, ?, ?, ?)',
                       (event_id, guest_id, 'tier_mismatch', err_msg))
        conn.commit()
        conn.close()
        return {'success': False, 'error': err_msg}, 400

    # 2. Brand separation protocol check
    rival_pairs = cursor.execute('SELECT brand_a, brand_b FROM rival_brands').fetchall()
    guest_brand = (guest['brand'] or '').strip().lower()

    if guest_brand:
        adjacent_assignments = cursor.execute('''
            SELECT sa.position, g.name, g.brand
            FROM seat_assignments sa
            JOIN guests g ON sa.guest_id = g.id
            WHERE sa.section_id = ? AND (sa.position = ? OR sa.position = ?) AND sa.guest_id != ?
        ''', (section_id, position - 1, position + 1, guest_id)).fetchall()

        for adj in adjacent_assignments:
            adj_brand = (adj['brand'] or '').strip().lower()
            if not adj_brand:
                continue
            is_separated = any(
                (guest_brand == p['brand_a'].strip().lower() and adj_brand == p['brand_b'].strip().lower()) or
                (guest_brand == p['brand_b'].strip().lower() and adj_brand == p['brand_a'].strip().lower())
                for p in rival_pairs
            )
            if is_separated:
                warn_msg = f"Brand Separation Alert: '{guest['name']}' ({guest['brand']}) and '{adj['name']}' ({adj['brand']}) are separated brands at Seat #{position} and Seat #{adj['position']}."
                warnings.append({'type': 'brand_clash', 'message': warn_msg})
                cursor.execute('INSERT INTO warning_log (event_id, guest_id, type, message) VALUES (?, ?, ?, ?)',
                               (event_id, guest_id, 'brand_clash', warn_msg))

    # Update or insert seat assignment
    existing = cursor.execute('SELECT id FROM seat_assignments WHERE guest_id = ?', (guest_id,)).fetchone()
    if existing:
        cursor.execute('UPDATE seat_assignments SET section_id = ?, position = ? WHERE guest_id = ?',
                       (section_id, position, guest_id))
    else:
        cursor.execute('INSERT INTO seat_assignments (guest_id, section_id, position) VALUES (?, ?, ?)',
                       (guest_id, section_id, position))

    conn.commit()
    conn.close()

    return {
        'success': True,
        'warnings': warnings,
        'message': f"Assigned {guest['name']} to {section['name']} (Seat #{position})"
    }

@app.route('/api/unassign_seat/<int:guest_id>', methods=['DELETE'])
def unassign_seat(guest_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM seat_assignments WHERE guest_id = ?', (guest_id,))
    conn.commit()
    conn.close()
    return {'success': True}

# ==================== REPORT & AGGREGATE ROUTES ====================
@app.route('/api/report/<int:event_id>', methods=['GET'])
def get_event_report(event_id):
    conn = get_db_connection()
    
    total_guests_row = conn.execute('SELECT COUNT(*) as total, SUM(checked_in) as checked_in FROM guests WHERE event_id = ?', (event_id,)).fetchone()
    total_guests = total_guests_row['total'] if total_guests_row else 0
    checked_in_guests = total_guests_row['checked_in'] or 0
    no_show_guests = total_guests - checked_in_guests
    overall_no_show_pct = round((no_show_guests / total_guests * 100), 1) if total_guests > 0 else 0

    tier_stats_rows = conn.execute('''
        SELECT tier, COUNT(*) as total, SUM(checked_in) as checked_in
        FROM guests
        WHERE event_id = ?
        GROUP BY tier
    ''', (event_id,)).fetchall()

    tier_stats = []
    for r in tier_stats_rows:
        tot = r['total']
        chk = r['checked_in'] or 0
        no_show = tot - chk
        no_show_pct = round((no_show / tot * 100), 1) if tot > 0 else 0
        tier_stats.append({
            'tier': r['tier'],
            'total': tot,
            'checked_in': chk,
            'no_show': no_show,
            'no_show_pct': no_show_pct
        })

    warning_counts_rows = conn.execute('''
        SELECT type, COUNT(*) as count
        FROM warning_log
        WHERE event_id = ?
        GROUP BY type
    ''', (event_id,)).fetchall()

    warning_counts = {r['type']: r['count'] for r in warning_counts_rows}
    warning_summary = {
        'tier_mismatch': warning_counts.get('tier_mismatch', 0),
        'brand_clash': warning_counts.get('brand_clash', 0),
        'capacity_full': warning_counts.get('capacity_full', 0),
        'total_warnings': sum(warning_counts.values())
    }

    warnings_list = conn.execute('SELECT * FROM warning_log WHERE event_id = ? ORDER BY id DESC LIMIT 50', (event_id,)).fetchall()
    conn.close()

    return {
        'event_id': event_id,
        'totals': {
            'total_guests': total_guests,
            'checked_in': checked_in_guests,
            'no_show': no_show_guests,
            'no_show_pct': overall_no_show_pct
        },
        'tier_stats': tier_stats,
        'warnings_summary': warning_summary,
        'recent_warnings': [dict(w) for w in warnings_list]
    }

if __name__ == '__main__':
    init_db()
    print("Runway Ready Backend running on http://127.0.0.1:5000 with SQLite3 Database")
    app.run(host='127.0.0.1', port=5000, debug=True)
