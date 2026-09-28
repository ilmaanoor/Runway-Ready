import sqlite3
import os
from flask import Flask, request, jsonify

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

    # Ensure new columns exist for existing databases
    cursor.execute("PRAGMA table_info(events)")
    existing_cols = [col['name'] for col in cursor.fetchall()]
    if 'location' not in existing_cols:
        cursor.execute("ALTER TABLE events ADD COLUMN location TEXT DEFAULT ''")
    if 'capacity' not in existing_cols:
        cursor.execute("ALTER TABLE events ADD COLUMN capacity INTEGER DEFAULT 100")
    if 'description' not in existing_cols:
        cursor.execute("ALTER TABLE events ADD COLUMN description TEXT DEFAULT ''")

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

    # Create rival_brands table
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

    # Seed default admin user if none exists
    cursor.execute('SELECT COUNT(*) as count FROM users')
    if cursor.fetchone()['count'] == 0:
        cursor.execute('''
            INSERT INTO users (name, email, password, role)
            VALUES 
                ('Admin User', 'admin@runway.com', 'admin123', 'admin'),
                ('PR Coordinator', 'pr@runway.com', 'pr123', 'pr_team'),
                ('Venue Manager', 'venue@runway.com', 'venue123', 'venue_team')
        ''')
        
        # Seed default event
        cursor.execute('''
            INSERT INTO events (name, date, type)
            VALUES ('Spring Runway Gala 2027', '2027-04-10', 'Physical')
        ''')
        event_id = cursor.lastrowid
        
        # Seed default sections for physical event
        cursor.execute('''
            INSERT INTO sections (event_id, name, allowed_tier, capacity)
            VALUES 
                (?, 'Front Row A (VIP)', 'VIP', 5),
                (?, 'Press Box B (Press)', 'Press', 6),
                (?, 'Buyer Lounge C (Buyer)', 'Buyer', 8),
                (?, 'General Gallery D', 'General', 10)
        ''', (event_id, event_id, event_id, event_id))

        # Seed sample rival brands
        cursor.execute('''
            INSERT INTO rival_brands (brand_a, brand_b)
            VALUES 
                ('Chanel', 'Dior'),
                ('Gucci', 'Prada'),
                ('Balenciaga', 'Versace')
        ''')

        # Seed sample guests
        cursor.execute('''
            INSERT INTO guests (event_id, name, tier, brand, checked_in)
            VALUES 
                (?, 'Anna Wintour', 'VIP', 'Vogue', 1),
                (?, 'Bernard Arnault', 'VIP', 'Dior', 0),
                (?, 'François-Henri Pinault', 'VIP', 'Gucci', 0),
                (?, 'Edward Enninful', 'Press', 'Chanel', 1),
                (?, 'Sarah Mower', 'Press', 'Vogue', 0),
                (?, 'Milan Buyer John', 'Buyer', 'Prada', 0)
        ''', (event_id, event_id, event_id, event_id, event_id, event_id))

    conn.commit()
    conn.close()

# Manual CORS setup helper so no external flask_cors library is needed
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
    return jsonify({'status': 'ok'}), 200

# ==================== USERS ROUTES ====================
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    conn = get_db_connection()
    user = conn.execute('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()
    conn.close()

    if user:
        return jsonify({'success': True, 'user': dict(user)})
    else:
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    users = conn.execute('SELECT id, name, email, role FROM users').fetchall()
    conn.close()
    return jsonify([dict(u) for u in users])

@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    role = data.get('role', 'viewer').strip()

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                       (name, email, password, role))
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return jsonify({'id': user_id, 'name': name, 'email': email, 'role': role}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 400

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ==================== EVENTS ROUTES ====================
@app.route('/api/events', methods=['GET'])
def get_events():
    conn = get_db_connection()
    events = conn.execute('SELECT * FROM events ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(e) for e in events])

@app.route('/api/events', methods=['POST'])
def add_event():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    date = data.get('date', '').strip()
    type_ = data.get('type', 'Physical').strip()
    location = data.get('location', '').strip()
    capacity = int(data.get('capacity', 100) or 100)
    description = data.get('description', '').strip()

    if not name or not date:
        return jsonify({'error': 'Event name and date are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO events (name, date, type, location, capacity, description) VALUES (?, ?, ?, ?, ?, ?)', 
        (name, date, type_, location, capacity, description)
    )
    event_id = cursor.lastrowid

    # Create default sections based on event type
    if type_ == 'Physical':
        default_sections = [
            ('Front Row A (VIP)', 'VIP', 5),
            ('Press Row B (Press)', 'Press', 6),
            ('Buyer Lounge C (Buyer)', 'Buyer', 8),
            ('General Gallery D', 'General', 10)
        ]
    else:
        default_sections = [
            ('VIP Stream Access', 'VIP', 100),
            ('Press Media Access', 'Press', 100),
            ('Buyer Pass Access', 'Buyer', 100),
            ('General Audience Stream', 'General', 500)
        ]

    for sec_name, tier, cap in default_sections:
        cursor.execute('INSERT INTO sections (event_id, name, allowed_tier, capacity) VALUES (?, ?, ?, ?)',
                       (event_id, sec_name, tier, cap))

    conn.commit()
    conn.close()
    return jsonify({'id': event_id, 'name': name, 'date': date, 'type': type_}), 201


# ==================== GUESTS ROUTES ====================
@app.route('/api/guests', methods=['GET'])
def get_guests():
    event_id = request.args.get('event_id')
    conn = get_db_connection()
    if event_id:
        guests = conn.execute('SELECT * FROM guests WHERE event_id = ? ORDER BY id DESC', (event_id,)).fetchall()
    else:
        guests = conn.execute('SELECT * FROM guests ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(g) for g in guests])

@app.route('/api/guests', methods=['POST'])
def add_guest():
    data = request.get_json() or {}
    event_id = data.get('event_id')
    name = data.get('name', '').strip()
    tier = data.get('tier', 'General').strip()
    brand = data.get('brand', '').strip()

    if not event_id or not name:
        return jsonify({'error': 'Event ID and Name are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO guests (event_id, name, tier, brand, checked_in) VALUES (?, ?, ?, ?, 0)',
                   (event_id, name, tier, brand))
    guest_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'id': guest_id, 'event_id': event_id, 'name': name, 'tier': tier, 'brand': brand, 'checked_in': 0}), 201

@app.route('/api/guests/<int:guest_id>', methods=['DELETE'])
def delete_guest(guest_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM seat_assignments WHERE guest_id = ?', (guest_id,))
    conn.execute('DELETE FROM guests WHERE id = ?', (guest_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/guests/<int:guest_id>/checkin', methods=['PUT'])
def toggle_checkin(guest_id):
    data = request.get_json() or {}
    checked_in = 1 if data.get('checked_in') else 0
    conn = get_db_connection()
    conn.execute('UPDATE guests SET checked_in = ? WHERE id = ?', (checked_in, guest_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'checked_in': checked_in})


# ==================== SECTIONS ROUTES ====================
@app.route('/api/sections', methods=['GET'])
def get_sections():
    event_id = request.args.get('event_id')
    conn = get_db_connection()
    if event_id:
        sections = conn.execute('SELECT * FROM sections WHERE event_id = ? ORDER BY id ASC', (event_id,)).fetchall()
    else:
        sections = conn.execute('SELECT * FROM sections ORDER BY id ASC').fetchall()
    conn.close()
    return jsonify([dict(s) for s in sections])

@app.route('/api/sections', methods=['POST'])
def add_section():
    data = request.get_json() or {}
    event_id = data.get('event_id')
    name = data.get('name', '').strip()
    allowed_tier = data.get('allowed_tier', 'General').strip()
    capacity = int(data.get('capacity', 10))

    if not event_id or not name:
        return jsonify({'error': 'Event ID and Section Name are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO sections (event_id, name, allowed_tier, capacity) VALUES (?, ?, ?, ?)',
                   (event_id, name, allowed_tier, capacity))
    section_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'id': section_id, 'event_id': event_id, 'name': name, 'allowed_tier': allowed_tier, 'capacity': capacity}), 201

@app.route('/api/sections/<int:section_id>', methods=['DELETE'])
def delete_section(section_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM seat_assignments WHERE section_id = ?', (section_id,))
    conn.execute('DELETE FROM sections WHERE id = ?', (section_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ==================== RIVAL BRANDS ROUTES ====================
@app.route('/api/rival_brands', methods=['GET'])
def get_rival_brands():
    conn = get_db_connection()
    rivals = conn.execute('SELECT * FROM rival_brands ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rivals])

@app.route('/api/rival_brands', methods=['POST'])
def add_rival_brand():
    data = request.get_json() or {}
    brand_a = data.get('brand_a', '').strip()
    brand_b = data.get('brand_b', '').strip()

    if not brand_a or not brand_b:
        return jsonify({'error': 'Both brand names are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO rival_brands (brand_a, brand_b) VALUES (?, ?)', (brand_a, brand_b))
    rival_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return jsonify({'id': rival_id, 'brand_a': brand_a, 'brand_b': brand_b}), 201

@app.route('/api/rival_brands/<int:rival_id>', methods=['DELETE'])
def delete_rival_brand(rival_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM rival_brands WHERE id = ?', (rival_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ==================== SEATING & RULE-ENGINE ROUTES ====================
@app.route('/api/seat_assignments', methods=['GET'])
def get_seat_assignments():
    event_id = request.args.get('event_id')
    conn = get_db_connection()
    if event_id:
        query = '''
            SELECT sa.*, g.name as guest_name, g.tier as guest_tier, g.brand as guest_brand, g.checked_in
            FROM seat_assignments sa
            JOIN guests g ON sa.guest_id = g.id
            WHERE g.event_id = ?
        '''
        assignments = conn.execute(query, (event_id,)).fetchall()
    else:
        query = '''
            SELECT sa.*, g.name as guest_name, g.tier as guest_tier, g.brand as guest_brand, g.checked_in
            FROM seat_assignments sa
            JOIN guests g ON sa.guest_id = g.id
        '''
        assignments = conn.execute(query).fetchall()
    conn.close()
    return jsonify([dict(a) for a in assignments])

@app.route('/api/assign_seat', methods=['POST'])
def assign_seat():
    data = request.get_json() or {}
    guest_id = data.get('guest_id')
    section_id = data.get('section_id')
    position = int(data.get('position', 1))

    if not guest_id or not section_id:
        return jsonify({'error': 'guest_id and section_id are required'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Fetch guest & section info
    guest = cursor.execute('SELECT * FROM guests WHERE id = ?', (guest_id,)).fetchone()
    section = cursor.execute('SELECT * FROM sections WHERE id = ?', (section_id,)).fetchone()

    if not guest or not section:
        conn.close()
        return jsonify({'error': 'Guest or Section not found'}), 404

    event_id = guest['event_id']
    warnings = []

    # RULE 1: Tier Mismatch
    if guest['tier'] != section['allowed_tier']:
        warn_msg = f"Tier Mismatch: Guest '{guest['name']}' ({guest['tier']}) assigned to section '{section['name']}' ({section['allowed_tier']})."
        warnings.append({'type': 'tier_mismatch', 'message': warn_msg})
        cursor.execute('INSERT INTO warning_log (event_id, guest_id, type, message) VALUES (?, ?, ?, ?)',
                       (event_id, guest_id, 'tier_mismatch', warn_msg))

    # RULE 2: Section Capacity Overflow
    current_count_row = cursor.execute('SELECT COUNT(*) as cnt FROM seat_assignments WHERE section_id = ? AND guest_id != ?',
                                       (section_id, guest_id)).fetchone()
    current_count = current_count_row['cnt'] if current_count_row else 0

    if current_count >= section['capacity']:
        warn_msg = f"Capacity Overflow: Section '{section['name']}' is full (Capacity: {section['capacity']})."
        warnings.append({'type': 'capacity_full', 'message': warn_msg})
        cursor.execute('INSERT INTO warning_log (event_id, guest_id, type, message) VALUES (?, ?, ?, ?)',
                       (event_id, guest_id, 'capacity_full', warn_msg))

    # RULE 3: Brand Clash Check
    # Look for guests sitting at position - 1 and position + 1 in the same section
    adjacent_seats = cursor.execute('''
        SELECT sa.position, g.name, g.brand 
        FROM seat_assignments sa
        JOIN guests g ON sa.guest_id = g.id
        WHERE sa.section_id = ? AND sa.position IN (?, ?) AND sa.guest_id != ?
    ''', (section_id, position - 1, position + 1, guest_id)).fetchall()

    if guest['brand']:
        guest_brand = guest['brand'].strip().lower()
        # Fetch all rival pairs
        rival_pairs = cursor.execute('SELECT brand_a, brand_b FROM rival_brands').fetchall()
        for adj in adjacent_seats:
            adj_brand = (adj['brand'] or '').strip().lower()
            if not adj_brand:
                continue
            # Check if guest_brand and adj_brand are rivals
            is_rival = False
            for pair in rival_pairs:
                ba = pair['brand_a'].strip().lower()
                bb = pair['brand_b'].strip().lower()
                if (guest_brand == ba and adj_brand == bb) or (guest_brand == bb and adj_brand == ba):
                    is_rival = True
                    break
            if is_rival:
                warn_msg = f"Brand Clash: '{guest['name']}' ({guest['brand']}) is seated next to rival brand guest '{adj['name']}' ({adj['brand']}) at position {adj['position']}."
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

    return jsonify({
        'success': True,
        'warnings': warnings,
        'message': f"Assigned {guest['name']} to {section['name']} (Seat #{position})"
    })

@app.route('/api/unassign_seat/<int:guest_id>', methods=['DELETE'])
def unassign_seat(guest_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM seat_assignments WHERE guest_id = ?', (guest_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})


# ==================== REPORT & AGGREGATE ROUTES ====================
@app.route('/api/report/<int:event_id>', methods=['GET'])
def get_event_report(event_id):
    conn = get_db_connection()
    
    # 1. Attendance Totals
    total_guests_row = conn.execute('SELECT COUNT(*) as total, SUM(checked_in) as checked_in FROM guests WHERE event_id = ?', (event_id,)).fetchone()
    total_guests = total_guests_row['total'] if total_guests_row else 0
    checked_in_guests = total_guests_row['checked_in'] or 0
    no_show_guests = total_guests - checked_in_guests
    overall_no_show_pct = round((no_show_guests / total_guests * 100), 1) if total_guests > 0 else 0

    # 2. No-Show % by Tier
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

    # 3. Warning Counts by Type
    warning_counts_rows = conn.execute('''
        SELECT type, COUNT(*) as count
        FROM warning_log
        WHERE event_id = ?
        GROUP BY type
    ''', (event_id,)).fetchall()

    warning_counts = {r['type']: r['count'] for r in warning_counts_rows}
    # Ensure default zero values for keys
    warning_summary = {
        'tier_mismatch': warning_counts.get('tier_mismatch', 0),
        'brand_clash': warning_counts.get('brand_clash', 0),
        'capacity_full': warning_counts.get('capacity_full', 0),
        'total_warnings': sum(warning_counts.values())
    }

    # 4. Detailed Warning Log List
    warnings_list = conn.execute('SELECT * FROM warning_log WHERE event_id = ? ORDER BY id DESC LIMIT 50', (event_id,)).fetchall()

    conn.close()

    return jsonify({
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
    })


if __name__ == '__main__':
    init_db()
    print("Runway Ready Backend running on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
