#!/usr/bin/env python3
# PyGuard Pre-Tool-Use Hook
# Validates Python code before execution and blocks dangerous operations

import json
import sys
import re
import ast
from pathlib import Path
from typing import Dict, Any, List


def is_dangerous_rm_command(command: str) -> bool:
    """
    Comprehensive detection of dangerous rm commands.
    Matches various forms of rm -rf and similar destructive patterns.
    """
    normalized = ' '.join(command.lower().split())
    
    patterns = [
        r'\brm\s+.*-[a-z]*r[a-z]*f',  # rm -rf, rm -fr, rm -Rf, etc.
        r'\brm\s+.*-[a-z]*f[a-z]*r',  # rm -fr variations
        r'\brm\s+--recursive\s+--force',
        r'\brm\s+--force\s+--recursive',
        r'\brm\s+-r\s+.*-f',
        r'\brm\s+-f\s+.*-r',
    ]
    
    for pattern in patterns:
        if re.search(pattern, normalized):
            return True
    
    dangerous_paths = [
        r'/', r'/\*', r'~', r'~/', r'\$HOME', r'\.\.', 
        r'\*', r'\.', r'\.\s*$'
    ]
    
    if re.search(r'\brm\s+.*-[a-z]*r', normalized):
        for path in dangerous_paths:
            if re.search(path, normalized):
                return True
    
    return False


def is_env_file_access(tool_name: str, tool_input: Dict[str, Any]) -> bool:
    """Check if any tool is trying to access .env files."""
    if tool_name in ['Read', 'Edit', 'MultiEdit', 'Write', 'Bash']:
        if tool_name in ['Read', 'Edit', 'MultiEdit', 'Write']:
            file_path = tool_input.get('file_path', '')
            if '.env' in file_path and not file_path.endswith('.env.sample'):
                return True
        
        elif tool_name == 'Bash':
            command = tool_input.get('command', '')
            env_patterns = [
                r'\b\.env\b(?!\.sample)',
                r'cat\s+.*\.env\b(?!\.sample)',
                r'echo\s+.*>\s*\.env\b(?!\.sample)',
                r'touch\s+.*\.env\b(?!\.sample)',
                r'cp\s+.*\.env\b(?!\.sample)',
                r'mv\s+.*\.env\b(?!\.sample)',
            ]
            
            for pattern in env_patterns:
                if re.search(pattern, command):
                    return True
    
    return False


def is_python_execution(command: str) -> bool:
    """Check if bash command is running Python."""
    return bool(re.search(r'\b(python|python3|py)\s+', command))


def extract_python_file(command: str) -> str | None:
    """Extract Python file path from bash command."""
    match = re.search(r'\b(?:python|python3|py)\s+([^\s]+\.py)', command)
    return match.group(1) if match else None


def validate_python_syntax(code: str) -> List[Dict[str, Any]]:
    """
    Validate Python syntax using AST parsing.
    Returns list of issues found.
    """
    try:
        ast.parse(code)
        return []
    except SyntaxError as e:
        return [{
            'type': 'SyntaxError',
            'line': e.lineno or 0,
            'message': e.msg,
            'text': e.text.strip() if e.text else '',
        }]
    except Exception:
        return []


def check_common_bugs(code: str) -> List[Dict[str, Any]]:
    """Check for common Python bugs via static analysis."""
    issues = []
    lines = code.split('\n')
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        
        if not stripped or stripped.startswith('#'):
            continue
        
        # Check for assignment in conditionals
        if re.match(r'\s*(if|elif|while)\s+', line):
            if re.search(r'\w+\s*=\s*\w+', line) and not re.search(r'[!=<>]=', line):
                issues.append({
                    'type': 'ComparisonError',
                    'line': i,
                    'message': 'Using assignment (=) instead of comparison (==)',
                    'text': stripped
                })
        
        # Check for missing colons
        if re.match(r'\s*(if|elif|else|for|while|def|class|try|except|finally|with)\b', line):
            if not re.search(r':\s*(#.*)?$', line):
                issues.append({
                    'type': 'MissingColon',
                    'line': i,
                    'message': 'Missing colon (:) after control statement',
                    'text': stripped
                })
    
    return issues


def validate_python_file(file_path: str) -> List[Dict[str, Any]]:
    """
    Validate a Python file for errors.
    Returns list of issues or empty list if valid.
    """
    try:
        path = Path(file_path)
        if not path.exists():
            return []  # File doesn't exist yet
        
        code = path.read_text(encoding='utf-8')
        
        # Run validations
        issues = []
        
        # Tier 1: Syntax validation
        syntax_issues = validate_python_syntax(code)
        issues.extend(syntax_issues)
        
        if syntax_issues:
            return issues  # Stop if syntax is broken
        
        # Tier 2: Common bugs
        bug_issues = check_common_bugs(code)
        issues.extend(bug_issues)
        
        return issues
        
    except Exception:
        return []  # Gracefully handle read errors


def format_validation_error(issues: List[Dict[str, Any]]) -> str:
    """Format validation issues into error message."""
    msg = "🛡️ PyGuard: Python validation failed\n\n"
    
    for issue in issues[:3]:  # Show first 3 issues
        msg += f"❌ Line {issue['line']}: {issue['message']}\n"
        if issue.get('text'):
            msg += f"   Code: {issue['text']}\n"
    
    if len(issues) > 3:
        msg += f"\n... and {len(issues) - 3} more issue(s)\n"
    
    msg += "\nFix these errors before running the script."
    return msg


def log_tool_use(input_data: Dict[str, Any]):
    """Log tool usage to file."""
    try:
        log_dir = Path.cwd() / 'logs'
        log_dir.mkdir(parents=True, exist_ok=True)
        log_path = log_dir / 'pre_tool_use.json'
        
        if log_path.exists():
            with open(log_path, 'r') as f:
                try:
                    log_data = json.load(f)
                except (json.JSONDecodeError, ValueError):
                    log_data = []
        else:
            log_data = []
        
        log_data.append(input_data)
        
        with open(log_path, 'w') as f:
            json.dump(log_data, f, indent=2)
    except Exception:
        pass  # Fail silently on logging errors


def main():
    """Main hook logic."""
    try:
        # Read JSON input from stdin
        input_data = json.load(sys.stdin)
        
        tool_name = input_data.get('tool_name', '')
        tool_input = input_data.get('tool_input', {})
        
        # === SECURITY CHECKS ===
        
        # Check 1: Block .env file access
        if is_env_file_access(tool_name, tool_input):
            print("BLOCKED: Access to .env files is prohibited", file=sys.stderr)
            print("Use .env.sample for templates", file=sys.stderr)
            sys.exit(2)
        
        # Check 2: Block dangerous rm commands
        if tool_name == 'Bash':
            command = tool_input.get('command', '')
            
            if is_dangerous_rm_command(command):
                print("BLOCKED: Dangerous rm command detected", file=sys.stderr)
                sys.exit(2)
            
            # === PYGUARD VALIDATION ===
            
            # Check 3: Validate Python code before execution
            if is_python_execution(command):
                file_path = extract_python_file(command)
                
                if file_path:
                    # Resolve relative paths
                    if not Path(file_path).is_absolute():
                        file_path = str(Path.cwd() / file_path)
                    
                    # Validate the Python file
                    issues = validate_python_file(file_path)
                    
                    if issues:
                        error_msg = format_validation_error(issues)
                        print(error_msg, file=sys.stderr)
                        sys.exit(2)  # Block execution
        
        # Log tool usage
        log_tool_use(input_data)
        
        # Allow execution
        sys.exit(0)
        
    except json.JSONDecodeError:
        sys.exit(0)  # Gracefully handle JSON errors
    except Exception:
        sys.exit(0)  # Fail open on unexpected errors


if __name__ == '__main__':
    main()
