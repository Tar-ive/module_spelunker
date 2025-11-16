# PyGuard Terminal Backend

WebSocket-enabled backend for the PyGuard Terminal, allowing real-time execution of PyGuard CLI commands from the browser.

## 🏗️ Architecture

- **FastAPI** - Modern Python web framework with async support
- **WebSockets** - Real-time bi-directional communication
- **Docker** - Containerized deployment for consistency
- **Heroku** - Cloud hosting with Eco Dyno (always-on)

## 📁 Project Structure

```
backend/
├── server.py              # FastAPI WebSocket server
├── terminal_manager.py    # Command execution engine
├── security.py            # Command whitelist & rate limiting
├── requirements.txt       # Python dependencies
└── README.md              # This file

# Root-level deployment files
Dockerfile                 # Container definition
Procfile                   # Heroku startup command
heroku.yml                 # Heroku container configuration
```

## 🔧 Local Development

### Prerequisites

- Python 3.14 or later
- pip package manager

### Setup

1. **Install dependencies:**

```bash
cd backend
pip install -r requirements.txt
```

2. **Set environment variables:**

Create a `.env` file in the backend directory:

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
GROQ_API_KEY=gsk_xxxxx  # Optional
PORT=8000
```

3. **Run the server:**

```bash
# From the root directory
python -m uvicorn backend.server:app --reload --port 8000

# Or from backend directory
cd backend
uvicorn server:app --reload --port 8000
```

4. **Test WebSocket connection:**

Visit: http://localhost:8000/health

Or test with wscat:
```bash
npm install -g wscat
wscat -c ws://localhost:8000/ws/terminal
```

## 🐳 Docker Development

Build and run locally with Docker:

```bash
# Build image
docker build -t pyguard-terminal .

# Run container
docker run -p 8000:8000 \
  -e ANTHROPIC_API_KEY=sk-ant-xxxxx \
  -e PORT=8000 \
  pyguard-terminal
```

## 🚀 Deployment to Heroku

### First-Time Setup

1. **Create Heroku app:**

```bash
heroku create pyguard-terminal-backend
```

2. **Set stack to container:**

```bash
heroku stack:set container -a pyguard-terminal-backend
```

3. **Set environment variables:**

```bash
heroku config:set ANTHROPIC_API_KEY=sk-ant-xxxxx -a pyguard-terminal-backend
heroku config:set GROQ_API_KEY=gsk_xxxxx -a pyguard-terminal-backend
```

4. **Deploy:**

```bash
# Add Heroku remote (if not already added)
git remote add heroku https://git.heroku.com/pyguard-terminal-backend.git

# Deploy
git push heroku main
```

5. **Enable Eco Dyno (no sleep, $5/month):**

```bash
heroku dyno:type eco -a pyguard-terminal-backend
heroku ps:scale web=1 -a pyguard-terminal-backend
```

### Subsequent Deployments

```bash
# Commit your changes
git add .
git commit -m "feat: update backend"

# Deploy to Heroku
git push heroku main
```

## 🔐 Security Features

### Command Whitelist

Only these commands are allowed:
- `pyguard` - All PyGuard CLI subcommands
- `clear` - Clear terminal
- `ls` - List files
- `cat` - Read files
- `pwd` - Show directory
- `echo` - Basic output
- `help` - Show help

### Blocked Patterns

- File deletion: `rm`
- Privilege escalation: `sudo`
- Network requests: `curl`, `wget`
- Package management: `pip`
- Command chaining: `&&`, `||`, `;`
- Pipes: `|`
- Command substitution: `$()`, backticks
- Path traversal: `../`

### Rate Limiting

- **Limit:** 10 commands per 5 minutes per WebSocket connection
- **Action:** Command rejected with error message

### Timeout Enforcement

- **Timeout:** 60 seconds per command
- **Reason:** Claude API calls can be slow (5-30s typical)
- **Action:** Process killed with timeout message

## 📡 WebSocket API

### Connection Endpoint

```
wss://pyguard-terminal-backend-7021cd12e898.herokuapp.com/ws/terminal
```

### Message Types

**From Client to Server:**

```json
{
  "command": "pyguard --help"
}
```

**From Server to Client:**

```json
// Waking up (cold start)
{
  "type": "waking",
  "message": "⏳ Waking up server..."
}

// Ready to accept commands
{
  "type": "ready",
  "message": "✅ Connected to PyGuard Terminal"
}

// Command output (streamed line-by-line)
{
  "type": "stdout",
  "line": "PyGuard v2.0.0"
}

// Error message
{
  "type": "error",
  "message": "❌ Command not allowed"
}

// Command completed
{
  "type": "complete"
}
```

## 🧪 Testing

### Health Check

```bash
curl https://pyguard-terminal-backend-7021cd12e898.herokuapp.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "api_key_configured": true,
  "active_connections": 0
}
```

### WebSocket Test

```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c wss://pyguard-terminal-backend-7021cd12e898.herokuapp.com/ws/terminal

# Send command
> {"command": "pyguard --help"}
```

## 📊 Monitoring

### View Logs

```bash
heroku logs --tail -a pyguard-terminal-backend
```

### Check Dyno Status

```bash
heroku ps -a pyguard-terminal-backend
```

### View Config

```bash
heroku config -a pyguard-terminal-backend
```

## 🐛 Troubleshooting

### WebSocket Connection Fails

1. Check Heroku dyno is running: `heroku ps`
2. Check logs: `heroku logs --tail`
3. Verify CORS origins in `server.py` include your frontend domain

### Commands Not Executing

1. Check ANTHROPIC_API_KEY is set: `heroku config:get ANTHROPIC_API_KEY`
2. Check PyGuard CLI is working: `heroku run python -c "import sys; sys.path.insert(0, '/app/bug-detector'); import cli"`
3. Check command is in whitelist: see `security.py`

### Rate Limiting Issues

Adjust limits in `security.py`:
```python
self.max_commands = 10
self.time_window = timedelta(minutes=5)
```

## 💰 Cost

- **Heroku Eco Dyno:** $5/month (always-on, 512MB RAM)
- **Claude API:** ~$0.03 per `pyguard fix` command
- **Groq API:** ~$0.001 per `pyguard extract` command

## 📝 License

Part of the Module Spelunker project.
