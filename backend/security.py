"""Security middleware for command validation and rate limiting."""

import re
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Tuple


class SecurityManager:
    """Handles command whitelisting, sanitization, and rate limiting."""
    
    # Only allow PyGuard CLI commands and basic utilities
    ALLOWED_COMMANDS = [
        "pyguard",      # All pyguard subcommands
        "python3",      # Python interpreter (for pyguard CLI)
        "clear",        # Terminal clear
        "ls",           # List files (for UX)
        "cat",          # Read files (for debugging)
        "pwd",          # Show directory
        "echo",         # Basic output
        "help",         # Terminal help
    ]
    
    # Dangerous patterns to block
    BLOCKED_PATTERNS = [
        r"rm\s",                          # File deletion
        r"sudo",                          # Elevated privileges
        r"curl",                          # Network requests
        r"wget",                          # Downloads
        r"pip\s",                         # Package management
        r"python3?\s(?!.*pyguard)",       # Python execution (except via pyguard)
        r"&&",                            # Command chaining
        r"\|\|",                          # OR command chaining
        r"\|",                            # Pipes (potential injection)
        r";",                             # Command separator
        r"\$\(",                          # Command substitution
        r"`",                             # Backticks
        r"\.\./",                         # Path traversal
        r">",                             # File redirection
        r"<",                             # Input redirection
    ]
    
    def __init__(self):
        # Rate limiting: track commands per connection
        self.rate_limits: Dict[str, List[datetime]] = defaultdict(list)
        self.max_commands = 10  # Max commands
        self.time_window = timedelta(minutes=5)  # Per 5 minutes
    
    def validate_command(self, command: str) -> Tuple[bool, str]:
        """
        Validate if command is allowed.
        
        Returns:
            (is_allowed, error_message)
        """
        if not command or not command.strip():
            return False, "Empty command"
        
        # Extract base command
        base_cmd = command.strip().split()[0]
        
        # Check if base command is allowed
        if base_cmd not in self.ALLOWED_COMMANDS:
            return False, f"Command '{base_cmd}' not allowed. Use 'help' for available commands."
        
        # Check for blocked patterns
        for pattern in self.BLOCKED_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                return False, f"Command contains forbidden pattern. Use 'help' for available commands."
        
        return True, ""
    
    def check_rate_limit(self, connection_id: str) -> bool:
        """
        Check if connection has exceeded rate limit.
        
        Returns:
            True if allowed, False if rate limit exceeded
        """
        now = datetime.now()
        
        # Get recent commands from this connection
        self.rate_limits[connection_id] = [
            ts for ts in self.rate_limits[connection_id]
            if now - ts < self.time_window
        ]
        
        # Check limit
        if len(self.rate_limits[connection_id]) >= self.max_commands:
            return False
        
        # Record this command
        self.rate_limits[connection_id].append(now)
        return True
