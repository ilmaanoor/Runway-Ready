# app.py — Simple Flask REST API Server for SQLite Database (<95 lines)
from flask import Flask, request
from db import get_db, init_db

app = Flask(__name__)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Allow-Methods'] = '*'
    return response

@app.route('/<path:p>', methods=['OPTIONS'])
@app.route('/', methods=['OPTIONS'])
def options_route(p=None):
    return {'status': 'ok'}, 200

# ==================== USERS & AUTH ====================
@app.route('/api/login', methods=['POST'])
def login():
    d = dict(request.form or request.values)
    user = get_db().execute('SELECT id, name, email, role FROM users WHERE email=? AND password=?', (d.get('email','').strip(), d.get('password','').strip())).fetchone()
    return {'success': True, 'user': dict(user)} if user else ({'success': False, 'message': 'Invalid credentials'}, 401)

@app.route('/api/users', methods=['GET', 'POST'])
def handle_users():
    conn = get_db()
    if request.method == 'POST':
        d = dict(request.form or request.values)
        conn.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', (d.get('name',''), d.get('email',''), d.get('password',''), d.get('role','coordinator')))
        conn.commit()
        return {'success': True}, 201
    return [dict(u) for u in conn.execute('SELECT id, name, email, password, role FROM users').fetchall()]

@app.route('/api/users/<int:uid>', methods=['DELETE'])
def delete_user(uid):
    conn = get_db()
    conn.execute('DELETE FROM users WHERE id=?', (uid,))
    conn.commit()
    return {'success': True}

# ==================== EVENTS & SECTIONS ====================
@app.route('/api/events', methods=['GET', 'POST'])
def handle_events():
    conn = get_db()
    if request.method == 'POST':
        d = dict(request.form or request.values)
        cap = int(d.get('capacity', 100) or 100)
        c = conn.cursor()
        c.execute('INSERT INTO events (name, date, type, location, capacity, description) VALUES (?, ?, ?, ?, ?, ?)', 
                  (d.get('name',''), d.get('date',''), d.get('type','Physical'), d.get('location',''), cap, d.get('description','')))
        eid = c.lastrowid
        is_v = d.get('type','Physical').lower() == 'virtual'
        c.execute("INSERT INTO sections (event_id, name, allowed_tier, capacity) VALUES (?, ?, 'VIP', ?), (?, ?, 'Press', ?), (?, ?, 'Buyer', ?), (?, ?, 'General', ?)",
                  (eid, 'VIP Stream' if is_v else 'Front Row (VIP)', max(1, round(cap*0.2)), eid, 'Press Stream' if is_v else 'Press Row (Press)', max(1, round(cap*0.2)),
                   eid, 'Buyer Stream' if is_v else 'Buyer Lounge (Buyer)', max(1, round(cap*0.25)), eid, 'General Stream' if is_v else 'General Gallery', max(1, cap - round(cap*0.65))))
        conn.commit()
        return {'id': eid}, 201
    return [dict(e) for e in conn.execute('SELECT * FROM events ORDER BY id ASC').fetchall()]

@app.route('/api/events/<int:eid>', methods=['DELETE'])
def delete_event(eid):
    conn = get_db()
    conn.execute('DELETE FROM seat_assignments WHERE guest_id IN (SELECT id FROM guests WHERE event_id=?)', (eid,))
    conn.execute('DELETE FROM guests WHERE event_id=?', (eid,))
    conn.execute('DELETE FROM sections WHERE event_id=?', (eid,))
    conn.execute('DELETE FROM events WHERE id=?', (eid,))
    conn.commit()
    return {'success': True}

@app.route('/api/sections/<int:eid>', methods=['GET'])
def get_sections(eid):
    return [dict(s) for s in get_db().execute('SELECT * FROM sections WHERE event_id=?', (eid,)).fetchall()]

@app.route('/api/sections/<int:sid>/capacity', methods=['POST'])
def set_capacity(sid):
    conn = get_db()
    conn.execute('UPDATE sections SET capacity=? WHERE id=?', (int(request.form.get('capacity', 10)), sid))
    conn.commit()
    return {'success': True}

# ==================== GUESTS & SEATING ====================
@app.route('/api/guests/<int:eid>', methods=['GET'])
def get_guests(eid):
    return [dict(g) for g in get_db().execute('SELECT * FROM guests WHERE event_id=?', (eid,)).fetchall()]

@app.route('/api/guests', methods=['POST'])
def add_guest():
    d = dict(request.form or request.values)
    conn = get_db()
    c = conn.cursor()
    c.execute('INSERT INTO guests (event_id, name, tier, brand, checked_in) VALUES (?, ?, ?, ?, 0)', (d.get('event_id'), d.get('name',''), d.get('tier','General'), d.get('brand','Independent')))
    conn.commit()
    return {'id': c.lastrowid}, 201

@app.route('/api/guests/<int:gid>', methods=['DELETE'])
def delete_guest(gid):
    conn = get_db()
    conn.execute('DELETE FROM seat_assignments WHERE guest_id=?', (gid,))
    conn.execute('DELETE FROM guests WHERE id=?', (gid,))
    conn.commit()
    return {'success': True}

@app.route('/api/guests/<int:gid>/checkin', methods=['POST'])
def checkin_guest(gid):
    conn = get_db()
    conn.execute('UPDATE guests SET checked_in=? WHERE id=?', (int(request.form.get('checked_in', 1)), gid))
    conn.commit()
    return {'success': True}

@app.route('/api/assignments/<int:eid>', methods=['GET'])
def get_assignments(eid):
    q = 'SELECT sa.id, sa.guest_id as guestId, sa.section_id as sectionId, sa.position, g.name as guestName, g.tier as guestTier, g.brand as guestBrand FROM seat_assignments sa JOIN guests g ON sa.guest_id=g.id WHERE g.event_id=?'
    return [dict(a) for a in get_db().execute(q, (eid,)).fetchall()]

@app.route('/api/assign_seat', methods=['POST'])
def assign_seat():
    d = dict(request.form or request.values)
    gid, sid, pos = int(d.get('guest_id')), int(d.get('section_id')), int(d.get('position', 1))
    conn = get_db()
    conn.execute('DELETE FROM seat_assignments WHERE guest_id=?', (gid,))
    conn.execute('INSERT INTO seat_assignments (guest_id, section_id, position) VALUES (?, ?, ?)', (gid, sid, pos))
    conn.commit()
    return {'success': True}

@app.route('/api/unassign_seat/<int:gid>', methods=['DELETE'])
def unassign_seat(gid):
    conn = get_db()
    conn.execute('DELETE FROM seat_assignments WHERE guest_id=?', (gid,))
    conn.commit()
    return {'success': True}

@app.route('/api/rivals', methods=['GET', 'POST'])
def handle_rivals():
    conn = get_db()
    if request.method == 'POST':
        d = dict(request.form or request.values)
        conn.execute('INSERT INTO rival_brands (brand_a, brand_b) VALUES (?, ?)', (d.get('brand_a',''), d.get('brand_b','')))
        conn.commit()
        return {'success': True}, 201
    return [dict(r) for r in conn.execute('SELECT * FROM rival_brands').fetchall()]

@app.route('/api/rivals/<int:rid>', methods=['DELETE'])
def delete_rival(rid):
    conn = get_db()
    conn.execute('DELETE FROM rival_brands WHERE id=?', (rid,))
    conn.commit()
    return {'success': True}

if __name__ == '__main__':
    init_db()
    print("Runway Ready Backend running on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
