"""FastAPI WebSocket server for PyGuard Terminal."""

import os
import asyncio
from typing import Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

from terminal_manager import TerminalManager
from security import SecurityManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="PyGuard Terminal Backend", version="1.0.0")

# CORS - Allow Vercel frontend
ALLOWED_ORIGINS = [
    "https://module-spelunker.vercel.app",
    "http://localhost:3000",         # Local development
    "http://127.0.0.1:3000",         # Local development alternative
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
active_connections: Dict[str, WebSocket] = {}


@app.on_event("startup")
async def startup_event():
    """Log startup and check environment."""
    logger.info("🚀 PyGuard Terminal Server starting...")
    
    # Check required environment variables
    if not os.getenv("ANTHROPIC_API_KEY"):
        logger.warning("⚠️  ANTHROPIC_API_KEY not set - pyguard fix/analyze will fail")
    else:
        logger.info("✓ ANTHROPIC_API_KEY configured")
    
    logger.info("✓ Server ready")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "PyGuard Terminal Backend",
        "version": "1.0.0",
        "status": "running",
        "websocket_endpoint": "/ws/terminal"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "api_key_configured": bool(os.getenv("ANTHROPIC_API_KEY")),
        "active_connections": len(active_connections)
    }


@app.websocket("/ws/terminal")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for terminal connections."""
    await websocket.accept()
    connection_id = str(id(websocket))
    active_connections[connection_id] = websocket
    
    logger.info(f"✓ WebSocket connected: {connection_id}")
    
    # Send waking message (simulate cold start)
    await websocket.send_json({
        "type": "waking",
        "message": "⏳ Waking up server..."
    })
    
    await asyncio.sleep(0.5)  # Simulate cold start delay
    
    # Send ready message
    await websocket.send_json({
        "type": "ready",
        "message": "✅ Connected to PyGuard Terminal"
    })
    
    # Initialize managers
    security_mgr = SecurityManager()
    terminal_mgr = TerminalManager(working_dir="/app/bug-detector")
    
    try:
        while True:
            # Receive command from client
            data = await websocket.receive_json()
            command = data.get("command", "").strip()
            
            if not command:
                continue
            
            logger.info(f"Command received: {command}")
            
            # Security check
            is_allowed, error_msg = security_mgr.validate_command(command)
            
            if not is_allowed:
                await websocket.send_json({
                    "type": "error",
                    "message": f"❌ {error_msg}"
                })
                continue
            
            # Rate limiting check
            if not security_mgr.check_rate_limit(connection_id):
                await websocket.send_json({
                    "type": "error",
                    "message": "❌ Rate limit exceeded. Wait 5 minutes."
                })
                continue
            
            # Execute command and stream output
            async for output_line in terminal_mgr.execute_command(command):
                await websocket.send_json({
                    "type": "stdout",
                    "line": output_line
                })
            
            # Send completion
            await websocket.send_json({
                "type": "complete"
            })
    
    except WebSocketDisconnect:
        logger.info(f"✗ WebSocket disconnected: {connection_id}")
        active_connections.pop(connection_id, None)
    
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        try:
            await websocket.send_json({
                "type": "error",
                "message": f"❌ Server error: {str(e)}"
            })
        except:
            pass
        active_connections.pop(connection_id, None)


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
