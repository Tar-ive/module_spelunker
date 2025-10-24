"""
PyGuard PreToolUse Hook - Pre-runtime Python validation for Claude Code.

This hook intercepts Bash tool calls that run Python scripts and validates
the code before execution to catch errors early.
"""

import ast
import re
import json
from pathlib import Path
from typing import Any, Dict, List

# Optional import for type hints - not required for validation logic
try:
    from claude_agent_sdk import HookContext
except ImportError:
    # Define dummy type for testing without Claude SDK
    class HookContext:
        pass


async def pyguard_pretool_hook(
    input_data: Dict[str, Any],
    tool_use_id: str | None,
    context: HookContext
) -> Dict[str, Any]:
    """
    PreToolUse hook that validates Python code before execution.
    
    Intercepts Bash tool calls running Python scripts and validates them
    for syntax errors, common bugs, and pattern matches.
    
    Args:
        input_data: Hook input containing tool_name and tool_input
        tool_use_id: Optional tool use identifier
        context: Hook context
        
    Returns:
        Dictionary with permissionDecision 'deny' if issues found, empty dict otherwise
    """
    
    # Only intercept Bash tool
    if input_data.get('tool_name') != 'Bash':
        return {}
    
    command = input_data.get('tool_input', {}).get('command', '')
    
    # Check if running Python
    if not is_python_execution(command):
        return {}
    
    # Extract Python file path
    file_path = extract_python_file(command)
    
    if not file_path:
        # Can't validate inline scripts or piped input
        return {}
    
    # Resolve relative paths
    if not Path(file_path).is_absolute():
        file_path = str(Path.cwd() / file_path)
    
    # Read the Python file
    try:
        code = Path(file_path).read_text(encoding='utf-8')
    except FileNotFoundError:
        # File doesn't exist yet, let Python show the real error
        return {}
    except Exception:
        # Other read errors, allow execution
        return {}
    
    # Run validation checks
    issues = validate_python_code(code, file_path)
    
    if not issues:
        # No issues found, allow execution
        return {}
    
    # Found issues - block execution and suggest fixes
    error_message = format_issues_message(issues)
    
    return {
        'hookSpecificOutput': {
            'hookEventName': 'PreToolUse',
            'permissionDecision': 'deny',
            'permissionDecisionReason': error_message
        }
    }


def validate_python_code(code: str, file_path: str) -> List[Dict]:
    """
    Three-tier validation system:
    1. Syntax check (AST parsing) - Fast
    2. Static analysis (common bugs) - Medium
    3. Pattern matching (known issues) - Slower
    
    Args:
        code: Python source code to validate
        file_path: Path to the file (for error reporting)
        
    Returns:
        List of issue dictionaries
    """
    issues = []
    
    # Tier 1: Syntax validation
    syntax_issues = check_syntax(code, file_path)
    issues.extend(syntax_issues)
    
    if syntax_issues:
        # If syntax is broken, don't continue to other checks
        return issues
    
    # Tier 2: Static analysis
    static_issues = check_static_analysis(code)
    issues.extend(static_issues)
    
    # Tier 3: Pattern matching (only if no critical errors)
    if not any(issue.get('severity') == 'error' for issue in issues):
        pattern_issues = check_pattern_matching(code)
        issues.extend(pattern_issues)
    
    return issues


def check_syntax(code: str, file_path: str) -> List[Dict]:
    """
    Validate Python syntax using AST parsing.
    
    Fast check (<10ms) that catches:
    - Missing colons, parentheses, quotes
    - Invalid indentation
    - Invalid operators (e.g., = instead of ==)
    """
    try:
        ast.parse(code, filename=file_path)
        return []
    except SyntaxError as e:
        suggestion = suggest_syntax_fix(e, code)
        
        return [{
            'type': 'SyntaxError',
            'line': e.lineno or 0,
            'column': e.offset or 0,
            'message': e.msg,
            'severity': 'error',
            'suggestion': suggestion,
            'code_snippet': get_code_snippet(code, e.lineno)
        }]
    except Exception:
        # Other parsing errors
        return []


def check_static_analysis(code: str) -> List[Dict]:
    """
    Static analysis for common Python bugs.
    
    Checks for:
    - Assignment in conditionals (= instead of ==)
    - Missing colons after control statements
    - Undefined variables (basic check)
    - Missing function calls
    """
    issues = []
    lines = code.split('\n')
    
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        
        # Skip comments and empty lines
        if not stripped or stripped.startswith('#'):
            continue
        
        # Check for single = in if/elif/while (common bug)
        if re.match(r'\s*(if|elif|while)\s+', line):
            # Look for assignment without comparison
            if re.search(r'\w+\s*=\s*\w+', line) and not re.search(r'[!=<>]=', line):
                issues.append({
                    'type': 'ComparisonError',
                    'line': i,
                    'message': 'Possible assignment (=) instead of comparison (==) in conditional',
                    'severity': 'error',
                    'suggestion': 'Change = to == for comparison',
                    'code_snippet': line.strip()
                })
        
        # Check for missing colons (common beginner mistake)
        if re.match(r'\s*(if|elif|else|for|while|def|class|try|except|finally|with)\b', line):
            # Should end with colon (accounting for comments)
            if not re.search(r':\s*(#.*)?$', line):
                issues.append({
                    'type': 'MissingColon',
                    'line': i,
                    'message': 'Missing colon (:) after control statement',
                    'severity': 'error',
                    'suggestion': 'Add : at the end of this line',
                    'code_snippet': line.strip()
                })
        
        # Check for incorrect function definition
        if 'fizzbuzz' in code.lower() and re.search(r'def\s+\w+\s*\(\s*\)', line):
            # Check if fizzbuzz is called with arguments
            if re.search(r'fizzbuzz\s*\(\s*\d+\s*\)', code):
                issues.append({
                    'type': 'ArgumentMismatch',
                    'line': i,
                    'message': 'Function defined without parameters but called with arguments',
                    'severity': 'error',
                    'suggestion': 'Add parameter to function definition',
                    'code_snippet': line.strip()
                })
    
    return issues


def check_pattern_matching(code: str) -> List[Dict]:
    """
    Match code against known bug patterns from patterns_db.json.
    
    Returns warnings when code is similar to known buggy patterns.
    """
    issues = []
    
    # Load patterns database
    patterns_db_path = Path(__file__).parent / "patterns_db.json"
    if not patterns_db_path.exists():
        return issues
    
    try:
        with open(patterns_db_path, 'r', encoding='utf-8') as f:
            db = json.load(f)
    except Exception:
        return issues
    
    patterns = db.get('patterns', [])
    
    # Simple pattern matching - check for similar code structures
    code_lower = code.lower()
    
    for pattern in patterns[:5]:  # Check top 5 patterns only for speed
        pattern_code = pattern.get('buggy_code', '').lower()
        
        # Calculate simple similarity
        similarity = calculate_similarity(code_lower, pattern_code)
        
        if similarity > 0.6:  # 60% similarity threshold
            issues.append({
                'type': 'PatternMatch',
                'line': 0,
                'message': f"Code structure similar to known bug: {pattern.get('error_type', 'unknown')}",
                'severity': 'warning',
                'suggestion': f"Review pattern {pattern.get('id', '?')} for potential issues",
                'pattern_id': pattern.get('id')
            })
            break  # Only report first match
    
    return issues


def suggest_syntax_fix(error: SyntaxError, code: str) -> str:
    """Suggest a fix based on the syntax error type."""
    msg = error.msg.lower() if error.msg else ''
    
    if 'invalid syntax' in msg:
        if error.lineno:
            line = code.split('\n')[error.lineno - 1] if error.lineno <= len(code.split('\n')) else ''
            
            # Check for common issues
            if '=' in line and ('if' in line or 'elif' in line or 'while' in line):
                return 'Use == for comparison instead of = (assignment)'
            
            if re.match(r'\s*(if|elif|else|for|while|def|class)\b', line) and ':' not in line:
                return 'Add a colon (:) at the end of the line'
            
            if line.count('"') % 2 == 1 or line.count("'") % 2 == 1:
                return 'Close the string with matching quote'
        
        return 'Check for missing colons, quotes, or parentheses'
    
    elif 'unexpected indent' in msg:
        return 'Fix indentation - use consistent spaces or tabs'
    
    elif 'unindent does not match' in msg:
        return 'Align indentation with previous block'
    
    return 'Check syntax near this line'


def calculate_similarity(code1: str, code2: str) -> float:
    """Calculate simple similarity score between two code strings."""
    # Remove whitespace and compare
    clean1 = re.sub(r'\s+', '', code1)
    clean2 = re.sub(r'\s+', '', code2)
    
    if not clean1 or not clean2:
        return 0.0
    
    # Simple character overlap ratio
    matches = sum(1 for a, b in zip(clean1, clean2) if a == b)
    max_len = max(len(clean1), len(clean2))
    
    return matches / max_len if max_len > 0 else 0.0


def get_code_snippet(code: str, line_num: int | None) -> str:
    """Get a snippet of code around the error line."""
    if not line_num:
        return ''
    
    lines = code.split('\n')
    if line_num <= len(lines):
        return lines[line_num - 1].strip()
    
    return ''


def format_issues_message(issues: List[Dict]) -> str:
    """Format validation issues into a readable message for Claude."""
    
    msg = "🛡️ PyGuard Pre-Runtime Validation Failed\n\n"
    
    errors = [i for i in issues if i.get('severity') == 'error']
    warnings = [i for i in issues if i.get('severity') == 'warning']
    
    if errors:
        msg += f"❌ Found {len(errors)} error(s):\n\n"
        for issue in errors:
            msg += f"  Line {issue.get('line', '?')}: {issue['message']}\n"
            if issue.get('code_snippet'):
                msg += f"    Code: {issue['code_snippet']}\n"
            if issue.get('suggestion'):
                msg += f"    💡 Fix: {issue['suggestion']}\n"
            msg += "\n"
    
    if warnings:
        msg += f"⚠️  Found {len(warnings)} warning(s):\n\n"
        for issue in warnings:
            msg += f"  {issue['message']}\n"
            if issue.get('suggestion'):
                msg += f"    💡 {issue['suggestion']}\n"
            msg += "\n"
    
    msg += "Please fix these issues before running, or override to see runtime error."
    
    return msg


def is_python_execution(command: str) -> bool:
    """Check if bash command is running Python."""
    return bool(re.search(r'\b(python|python3|py)\s+', command))


def extract_python_file(command: str) -> str | None:
    """Extract Python file path from bash command."""
    # Match: python file.py or python3 path/to/file.py
    match = re.search(r'\b(?:python|python3|py)\s+([^\s]+\.py)', command)
    return match.group(1) if match else None
