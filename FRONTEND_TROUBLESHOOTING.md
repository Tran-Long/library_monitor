# 🔧 Frontend Troubleshooting Guide

## Frontend Not Showing at localhost:3000

If you don't see the Library Monitor interface, follow these steps:

### Step 1: Check Browser Console for Errors

1. Open http://localhost:3000 in your browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look for any red error messages

**Common errors and solutions:**

| Error | Solution |
|-------|----------|
| `Cannot GET /api/libraries/` | Backend API not running. Check `docker compose logs backend` |
| `CORS error` | Backend CORS not configured properly. Restart with `docker compose restart backend` |
| `Failed to fetch` | Backend service unreachable. Check it's running: `docker compose logs backend` |
| `React not rendering` | CSS not loading. Check Network tab in DevTools |

### Step 2: Check Frontend Container Logs

```bash
docker compose logs frontend -f
```

Look for:
- ✅ `VITE v5.x.x ready in XXX ms` - Frontend is running
- ❌ `Error` messages - Indicates a problem

### Step 3: Verify Services are Running

```bash
docker compose ps
```

You should see:
```
library_monitor-frontend-1  ✓  Up  0.0.0.0:3000->3000/tcp
library_monitor-backend-1   ✓  Up  0.0.0.0:8000->8000/tcp
library_monitor-db-1        ✓  Up  0.0.0.0:5432->5432/tcp
```

### Step 4: Test Backend API

Open http://localhost:8000/api in your browser. You should see the API endpoint list.

If you get an error, check backend logs:
```bash
docker compose logs backend -f
```

### Step 5: Check Network Request

In **DevTools** → **Network** tab:
1. Reload the page
2. Look for a request to `/api/libraries/`
3. Check the **Response** tab
   - ✅ Should show JSON array: `[]` or `[{...}]`
   - ❌ Should NOT show HTML error page

### Step 6: Force Refresh Frontend

Sometimes caching causes issues:

1. Hard refresh browser: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Or clear browser cache and reload
3. Or restart frontend: `docker compose restart frontend`

### Step 7: Check CSS is Loading

In **DevTools** → **Styles** or **Elements** tab:
- Look for Tailwind CSS classes like `bg-gray-100`, `text-gray-900`
- If styling is missing, Tailwind build might have failed

Rebuild frontend:
```bash
docker compose rebuild frontend
docker compose restart frontend
```

---

## What You Should See

### Page Content
```
🏛️ Library Monitor
Manage your library collection efficiently

Libraries (0)

No libraries yet. Create one to get started!
```

### If Backend is Working
The page might say `Libraries (5)` and show library cards instead.

### What to Check in DevTools

**Console Tab:**
- ✅ No red errors
- ✅ Might see: `Loading libraries...` message

**Network Tab:**
- ✅ `index.html` - Status 200
- ✅ `main.tsx` - Status 200 (or 304 cached)
- ✅ `/api/libraries/` - Status 200 with JSON response

**Application Tab (for React):**
- ✅ React DevTools installed (optional but helpful)
- ✅ Can inspect React components

---

## Quick Fix Commands

### Frontend not showing anything:
```bash
docker compose restart frontend
```

### CSS/styling not working:
```bash
docker compose rebuild frontend
docker compose restart frontend
```

### API errors:
```bash
docker compose logs backend
docker compose restart backend
```

### Everything broken:
```bash
docker compose down
docker compose up -d
```

---

## Testing the Frontend Step by Step

### 1. Test if page loads
```bash
curl http://localhost:3000 | head -20
```
Should show HTML with `Library Monitor` title.

### 2. Test if API responds
```bash
curl http://localhost:8000/api/libraries/
```
Should show `[]` or JSON array.

### 3. Test if they can communicate
Open http://localhost:3000 in browser, check Console for fetch requests.

---

## Enable Debug Logging

Add this to App.tsx temporarily to see what's happening:

```typescript
useEffect(() => {
  console.log('App mounted, loading libraries...')
  loadLibraries()
}, [])

const loadLibraries = async () => {
  console.log('Fetching from /api/libraries/')
  try {
    setLoading(true)
    const response = await fetch('/api/libraries/')
    console.log('Response status:', response.status)
    const data = await response.json()
    console.log('Libraries loaded:', data)
    setLibraries(data)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    setLoading(false)
  }
}
```

Then check Console for logs.

---

## Port Issues

If localhost:3000 won't connect:

Check if port is in use:
```bash
lsof -i :3000  # Linux/Mac
netstat -an | findstr :3000  # Windows
```

Change port in docker-compose.yml:
```yaml
frontend:
  ports:
    - "3001:3000"  # Use 3001 instead
```

Then access http://localhost:3001

---

## Still Not Working?

1. **Restart everything:**
   ```bash
   docker compose down
   docker compose up -d
   sleep 5
   ```

2. **Check all services:**
   ```bash
   docker compose ps
   docker compose logs
   ```

3. **Rebuild containers:**
   ```bash
   docker compose down
   docker compose up -d --build
   ```

4. **Check Docker status:**
   ```bash
   docker ps -a  # See all containers
   docker images  # See all images
   ```

---

## Quick Checklist

- [ ] Frontend container is running: `docker compose ps`
- [ ] Backend container is running: `docker compose ps`
- [ ] Database container is running: `docker compose ps`
- [ ] Browser shows Library Monitor header
- [ ] Network tab shows `/api/libraries/` request
- [ ] Console has no red errors
- [ ] Check backend logs: `docker compose logs backend`
- [ ] Check frontend logs: `docker compose logs frontend`

---

## Next Steps

Once you see the page loading:
1. Read [DEVELOPMENT.md](../DEVELOPMENT.md) to learn how to extend it
2. Try creating test data via `/admin` endpoint
3. Implement drag-and-drop functionality
4. Add forms for creating libraries

---

**For more help, check the main documentation files!**
