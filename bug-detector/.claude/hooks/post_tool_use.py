#!/usr/bin/env python3
# PyGuard Post-Tool-Use Hook
# Logs successful tool executions and validates Python script outputs

import json
import sys
from pathlib import Path
from datetime import datetime


def log_tool_execution(input_data: dict):
    """Log successful tool execution."""
    try:
        log_dir = Path.cwd() / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / 'post_tool_use.json'
        
        # Add timestamp
        input_data['timestamp'] = datetime.now().isoformat()
        
        if log_path.exists():
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []
        
        log_data.append(input_data)
        
        # Keep only last 100 entries
        if len(log_data) > 100:
            log_data = log_data[-100:]
        
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)
    except Exception:
        pass  # Fail silently


def check_python_execution_success(input_data: dict) -> bool:
    """Check if Python script executed successfully."""
    tool_name = input_data.get('tool_name', '')
    tool_input = input_data.get('tool_input', {})
    tool_result = input_data.get('tool_result', {})
    
    if tool_name == 'Bash':
        command = tool_input.get('command', '')
        
        # Check if it was a Python execution
        if any(py in command for py in ['python', 'python3']):
            exit_code = tool_result.get('exitCode', 0)
            output = tool_result.get('output', '')
            
            # Log success/failure
            success = exit_code == 0
            
            if success:
                print(f"✅ Python script executed successfully", file=sys.stderr)
            else:
                print(f"❌ Python script failed with exit code {exit_code}", file=sys.stderr)
            
            return success
    
    return True


def main():
    """Main post-tool-use hook logic."""
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
        
        # Check Python execution results
        check_python_execution_success(input_data)
        
        # Log the execution
        log_tool_execution(input_data)
        
        # Always exit 0 (post hooks don't block)
        sys.exit(0)
        
    except json.JSONDecodeError:
        sys.exit(0)
    except Exception:
        sys.exit(0)


if __name__ == '__main__':
    main()
