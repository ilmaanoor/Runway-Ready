@echo off
title Runway Ready — DB Sync Tool

echo.
echo  Syncing database from backend to VS Code workspace...
echo.

python -c "
import shutil, os, sqlite3

src = r'C:\Users\Ilmaa Noor\runway-ready\backend\runway_ready.db'
dst = r'C:\Users\Ilmaa Noor\.gemini\antigravity\scratch\runway-ready\backend\runway_ready.db'

if not os.path.exists(src):
    print('  ERROR: Backend database not found at:', src)
    print('  Make sure the Flask backend has been run at least once.')
else:
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(src, dst)
    conn = sqlite3.connect(src)
    events = conn.execute('SELECT id, name, type FROM events ORDER BY id').fetchall()
    guests = conn.execute('SELECT COUNT(*) FROM guests').fetchone()[0]
    rules = conn.execute('SELECT COUNT(*) FROM rival_brands').fetchone()[0]
    conn.close()
    print('  Database synced successfully!')
    print()
    print('  Events in database: ' + str(len(events)))
    for e in events:
        print('    -', str(e[0]) + '.', e[1], '(' + e[2] + ')')
    print('  Total Guests: ' + str(guests))
    print('  Separation Rules: ' + str(rules))
" 2>&1

echo.
echo  Now in VS Code:
echo    1. Open the Explorer panel (left sidebar)
echo    2. Navigate to: scratch/runway-ready/backend/runway_ready.db
echo    3. Click on runway_ready.db to view it
echo    4. Click the Refresh button in the SQLite Viewer toolbar
echo.
pause
