#!/usr/bin/env python3
# User Prompt Submit Hook
# Logs user prompts for analytics and debugging

import json
import sys
from pathlib import Path
from datetime import datetime


def log_user_prompt(input_data: dict):
    """Log user prompts to file."""
    try:
        log_dir = Path.cwd() / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / 'user_prompts.json'
        
        # Add timestamp
        entry = {
            'timestamp': datetime.now().isoformat(),
            'prompt': input_data.get('prompt', ''),
            'session_id': input_data.get('session_id', 'unknown')
        }
        
        if log_path.exists():
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []
        
        log_data.append(entry)
        
        # Keep only last 50 prompts
        if len(log_data) > 50:
            log_data = log_data[-50:]
        
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)
            
    except Exception:
        pass  # Fail silently


def main():
    """Main user prompt hook logic."""
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
        
        # Log the prompt
        log_user_prompt(input_data)
        
        # Always exit 0 (doesn't modify or block)
        sys.exit(0)
        
    except json.JSONDecodeError:
        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == '__main__':
    main()
