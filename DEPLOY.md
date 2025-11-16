# 🚀 Deployment Guide - WebSocket Terminal

## Quick Start - Deploy Now!

### Step 1: Stage and Commit Changes

```bash
# Stage all new backend files
git add backend/ Dockerfile Procfile heroku.yml lib/websocket-client.ts

# Stage modified files
git add components/pyguard/pyguard-terminal.tsx .gitignore

# Stage documentation
git add docs/IMPLEMENTATION_SUMMARY.md

# Commit with descriptive message
git commit -m "feat: implement WebSocket terminal backend with real PyGuard CLI execution

- Add FastAPI WebSocket server (backend/server.py)
- Add security layer with command whitelist (backend/security.py)
- Add async terminal manager with streaming (backend/terminal_manager.py)
- Add WebSocket client with auto-reconnect (lib/websocket-client.ts)
- Refactor terminal component to use real backend
- Add Docker deployment configuration
- Add Heroku deployment files (Procfile, heroku.yml)
- Add comprehensive backend documentation

Closes WebSocket Terminal implementation"
```

### Step 2: Deploy to Heroku

```bash
# Push to Heroku (this will trigger Docker build)
git push heroku main

# Monitor deployment logs
heroku logs --tail -a pyguard-terminal-backend
```

### Step 3: Enable Eco Dyno (Always-On)

```bash
# Upgrade to Eco dyno ($5/month - no sleep)
heroku dyno:type eco -a pyguard-terminal-backend

# Scale to 1 web dyno
heroku ps:scale web=1 -a pyguard-terminal-backend

# Verify dyno is running
heroku ps -a pyguard-terminal-backend
```

### Step 4: Test Backend Deployment

```bash
# Test health endpoint
curl https://pyguard-terminal-backend-7021cd12e898.herokuapp.com/health

# Expected response:
# {
#   "status": "healthy",
#   "api_key_configured": true,
#   "active_connections": 0
# }

# Test WebSocket (optional - requires wscat)
npm install -g wscat
wscat -c wss://pyguard-terminal-backend-7021cd12e898.herokuapp.com/ws/terminal

# Type: {"command": "help"}
```

### Step 5: Deploy Frontend to Vercel

```bash
# Push to origin (Vercel auto-deploys)
git push origin main

# Or manually deploy
npx vercel --prod
```

### Step 6: Test End-to-End

1. Visit: https://module-spelunker.vercel.app/pyguard
2. Wait for "Connected to PyGuard Terminal" message
3. Type: `help`
4. Type: `pyguard --help`
5. Type: `clear`
6. Type: `ls`

**Expected Behavior:**
- Connection indicator shows "● Online" (green)
- Commands execute and show real output
- Output streams line-by-line
- Errors display with helpful messages

---

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Check build logs
heroku logs --tail -a pyguard-terminal-backend

# Common issues:
# 1. Missing dependencies - check requirements.txt
# 2. Port binding - Heroku sets $PORT automatically
# 3. Missing env vars - check config
heroku config -a pyguard-terminal-backend
```

### WebSocket Connection Fails

```bash
# Check if dyno is running
heroku ps -a pyguard-terminal-backend

# Restart dyno
heroku restart -a pyguard-terminal-backend

# Check CORS settings in server.py
# Make sure frontend URL is in ALLOWED_ORIGINS
```

### Commands Not Executing

```bash
# Check API key is set
heroku config:get ANTHROPIC_API_KEY -a pyguard-terminal-backend

# Set if missing
heroku config:set ANTHROPIC_API_KEY=sk-ant-xxxxx -a pyguard-terminal-backend

# Check PyGuard CLI is available
heroku run ls /app/bug-detector -a pyguard-terminal-backend
```

---

## 📊 Post-Deployment Monitoring

### View Logs

```bash
# Real-time logs
heroku logs --tail -a pyguard-terminal-backend

# Filter by source
heroku logs --source app -a pyguard-terminal-backend

# Last 100 lines
heroku logs -n 100 -a pyguard-terminal-backend
```

### Check Metrics

```bash
# Dyno status
heroku ps -a pyguard-terminal-backend

# App info
heroku apps:info -a pyguard-terminal-backend
```

### Health Monitoring

Set up periodic health checks:

```bash
# Add to cron or monitoring service
curl https://pyguard-terminal-backend-7021cd12e898.herokuapp.com/health
```

---

## 💰 Cost Verification

```bash
# Check dyno type
heroku ps -a pyguard-terminal-backend

# Should show:
# === web (Eco): uvicorn backend.server:app --host 0.0.0.0 --port $PORT (1)
# web.1: up 2024/11/15 18:00:00 +0000 (~ 1m ago)
```

**Expected Cost:**
- Eco Dyno: $5/month
- No other charges unless using Claude API

---

## 🎯 Verification Checklist

After deployment, verify:

- [ ] Heroku backend deployed successfully
- [ ] Health endpoint returns 200 OK
- [ ] WebSocket accepts connections
- [ ] Commands execute and return output
- [ ] Security whitelist blocks dangerous commands
- [ ] Rate limiting works (try 11 commands quickly)
- [ ] Frontend connects to backend
- [ ] Auto-reconnect works on disconnect
- [ ] Error messages display correctly
- [ ] Eco dyno is running (no cold starts)

---

## 📝 Environment Variables

### Required on Heroku

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx  # For pyguard fix/analyze
PORT=(auto-set by Heroku)       # Don't set manually
```

### Optional

```bash
GROQ_API_KEY=gsk_xxxxx          # For pyguard extract (OCR)
```

### Required on Vercel

```bash
NEXT_PUBLIC_WS_URL=wss://pyguard-terminal-backend-7021cd12e898.herokuapp.com/ws/terminal
```

Already configured in `.env.production` ✅

---

## 🔄 Updating After Deployment

```bash
# 1. Make changes to backend code
# 2. Commit changes
git add .
git commit -m "fix: update backend logic"

# 3. Deploy to Heroku
git push heroku main

# 4. Verify deployment
heroku logs --tail -a pyguard-terminal-backend
```

---

## 📚 Additional Resources

- **Spec**: `docs/specs/websocket-terminal-implementation.md`
- **Backend README**: `backend/README.md`
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md`
- **Heroku Docs**: https://devcenter.heroku.com/articles/container-registry-and-runtime

---

**Status:** Ready for deployment! 🚀
