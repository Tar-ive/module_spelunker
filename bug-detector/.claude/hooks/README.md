# 🛡️ PyGuard Claude Code Hooks

This directory contains PyGuard hooks that integrate with Claude Code to provide pre-runtime Python validation and security checks.

## Hooks Overview

### `pre_tool_use.py` ⭐ Main Hook

**Purpose:** Validates Python code BEFORE execution and blocks dangerous operations.

**Features:**
- 🐍 **Python Validation**: AST syntax checking + static analysis
- 🛡️ **Security Checks**: Blocks dangerous `rm -rf` commands
- 🔒 **Secrets Protection**: Blocks access to `.env` files
- 📝 **Logging**: Records all tool usage attempts

**Exit Codes:**
- `0` - Allow tool execution
- `2` - Block tool execution (shows error to Claude)

**Example Flow:**
```
User: "Create and run fizzbuzz.py"
  ↓
Claude: Creates file with syntax error (i%3=0)
  ↓
Claude: Tries to execute → python fizzbuzz.py
  ↓
pre_tool_use.py: [INTERCEPTS]
  - Validates fizzbuzz.py
  - Finds syntax error
  - Exits with code 2
  ↓
Claude: Sees error, fixes code, tries again
  ↓
pre_tool_use.py: [ALLOWS] - No errors found
  ↓
Success! ✅
```

### `post_tool_use.py`

**Purpose:** Logs successful tool executions and validates outputs.

**Features:**
- ✅ **Success Logging**: Records successful executions
- 📊 **Analytics**: Tracks Python script exit codes
- 🕒 **Timestamps**: All entries include execution time

### `user_prompt_submit.py`

**Purpose:** Logs user prompts for debugging and analytics.

**Features:**
- 📝 **Prompt Logging**: Saves user queries
- 🔍 **Session Tracking**: Links prompts to sessions
- 📈 **Usage Analytics**: Understand user patterns

## Installation

### Automatic (Recommended)

```bash
cd bug-detector
python3 pyguard_setup.py
```

### Manual

1. Ensure hooks are executable:
   ```bash
   chmod +x .claude/hooks/*.py
   ```

2. Claude Code will automatically detect and use hooks in `.claude/hooks/`

## Configuration

Edit `.claude/settings.json`:

```json
{
  "pyguard": {
    "enabled": true,
    "features": {
      "syntax_validation": true,
      "static_analysis": true,
      "security_checks": true
    }
  }
}
```

## Testing Hooks

### Test Pre-Tool-Use Hook

```bash
# Create test input
echo '{
  "tool_name": "Bash",
  "tool_input": {
    "command": "python buggy_script.py"
  }
}' | .claude/hooks/pre_tool_use.py

# Check exit code
echo $?  # 0 = allowed, 2 = blocked
```

### Test with Buggy Python Code

1. Create a buggy script:
   ```bash
   cat > test_buggy.py << 'EOF'
   def test():
       if x=5:  # Syntax error
           print("test")
   EOF
   ```

2. Test the hook:
   ```bash
   echo '{
     "tool_name": "Bash",
     "tool_input": {
       "command": "python test_buggy.py"
     }
   }' | .claude/hooks/pre_tool_use.py
   ```

3. Should output:
   ```
   🛡️ PyGuard: Python validation failed
   
   ❌ Line 2: Using assignment (=) instead of comparison (==)
      Code: if x=5:
   ```

### Test Security Checks

```bash
# Test dangerous rm command
echo '{
  "tool_name": "Bash",
  "tool_input": {
    "command": "rm -rf /"
  }
}' | .claude/hooks/pre_tool_use.py

# Should output: BLOCKED: Dangerous rm command detected
```

```bash
# Test .env file access
echo '{
  "tool_name": "Read",
  "tool_input": {
    "file_path": ".env"
  }
}' | .claude/hooks/pre_tool_use.py

# Should output: BLOCKED: Access to .env files is prohibited
```

## Validation Rules

### Python Syntax Validation

PyGuard catches:
- Missing colons after `if`, `for`, `def`, etc.
- Unclosed quotes or parentheses
- Assignment `=` instead of comparison `==`
- Invalid indentation

### Security Rules

PyGuard blocks:
- `rm -rf` commands (all variations)
- Access to `.env` files (allows `.env.sample`)
- Dangerous path operations

## Logs

Hooks create logs in the `logs/` directory:

```
logs/
├── pre_tool_use.json    # All tool usage attempts
├── post_tool_use.json   # Successful executions
└── user_prompts.json    # User prompt history
```

### View Logs

```bash
# View recent tool usage
cat logs/pre_tool_use.json | python3 -m json.tool | tail -50

# View successful executions
cat logs/post_tool_use.json | python3 -m json.tool | tail -50

# View user prompts
cat logs/user_prompts.json | python3 -m json.tool | tail -20
```

## Customization

### Add Custom Validation Rules

Edit `pre_tool_use.py`:

```python
def check_custom_rule(code: str) -> List[Dict[str, Any]]:
    """Add your custom validation logic."""
    issues = []
    
    # Example: Warn about print statements in production code
    if 'print(' in code and 'production' in Path.cwd().name:
        issues.append({
            'type': 'Warning',
            'line': 0,
            'message': 'Print statements in production code',
            'text': ''
        })
    
    return issues

# Add to validate_python_file():
custom_issues = check_custom_rule(code)
issues.extend(custom_issues)
```

### Disable Specific Checks

```python
# In pre_tool_use.py main():

# Disable .env check
# if is_env_file_access(tool_name, tool_input):
#     pass

# Disable rm -rf check
# if is_dangerous_rm_command(command):
#     pass
```

## How Claude Code Uses Hooks

Claude Code automatically:
1. Detects hooks in `.claude/hooks/` directory
2. Calls `pre_tool_use.py` BEFORE tool execution
3. Reads exit code:
   - `0` → Allow execution
   - `2` → Block execution, show stderr to Claude
4. Calls `post_tool_use.py` AFTER successful execution

**No additional configuration needed!**

## Troubleshooting

### Hook not executing

```bash
# Check if executable
ls -la .claude/hooks/

# Should show: -rwxr-xr-x

# Make executable if needed
chmod +x .claude/hooks/*.py
```

### Hook errors not showing

```bash
# Test hook directly
echo '{"tool_name": "Bash", "tool_input": {"command": "python test.py"}}' | .claude/hooks/pre_tool_use.py

# Check stderr output
```

### Logs not created

```bash
# Check permissions
mkdir -p logs
chmod 755 logs
```

## Integration with PyGuard System

These hooks work alongside the PyGuard Python library:

- **Hooks** → Used by Claude Code automatically
- **`pyguard_hook.py`** → Used in Python scripts with Claude SDK
- **Both** → Share validation logic and patterns database

## Performance

- **Syntax validation:** ~5-10ms
- **Static analysis:** ~50-100ms
- **Total overhead:** Usually <100ms

Very fast! Won't slow down Claude Code.

## Best Practices

1. **Keep hooks lightweight** - Fast validation is key
2. **Fail gracefully** - Use `try/except` to avoid breaking Claude
3. **Log everything** - Helps debug issues
4. **Test frequently** - Use provided test commands
5. **Version control** - Commit hooks with your project

## Examples

See `examples/` directory for:
- `test_local_validation.py` - Test validation without Claude Code
- `basic_usage.py` - Full integration example

## Support

- **Main docs:** [PYGUARD_README.md](../../PYGUARD_README.md)
- **Getting started:** [GETTING_STARTED.md](../../GETTING_STARTED.md)
- **Issues:** Test with `test_local_validation.py`

---

**🎉 Your Python code is now protected by PyGuard hooks!**
