# 🚀 Getting Started with PyGuard

Welcome to PyGuard! This guide will help you set up and use PyGuard as a PreToolUse hook for Claude Code.

## What You'll Learn

1. How to install PyGuard
2. How to integrate it with Claude Code
3. How to test it locally
4. Common usage patterns

---

## Step 1: Install Dependencies

```bash
cd bug-detector

# Install Python dependencies
pip3 install -r requirements.txt
```

**Required packages:**
- `claude-agent-sdk` - For Claude Code integration
- `groq` - For OCR (pattern extraction only)
- `python-dotenv` - Environment configuration
- `click` - CLI framework

---

## Step 2: Extract Bug Patterns (One-time)

```bash
# Configure Groq API key (for OCR)
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Extract patterns from /patterns directory
python3 cli.py extract
```

This creates `patterns_db.json` with 13 bug patterns.

---

## Step 3: Test PyGuard Locally

Test validation without needing Claude Code:

```bash
python3 examples/test_local_validation.py
```

**Expected Output:**
```
🛡️  PyGuard Validation Tests
==================================================

🧪 Test 1: Syntax Validation
--------------------------------------------------
✓ Detected issues:
  Line 4: cannot assign to expression
  💡 Fix: Use == for comparison instead of =

✅ Tests complete!
```

If all tests pass, PyGuard is ready to use!

---

## Step 4: Set Up for Your Project

### Option A: Auto Setup
```bash
python3 pyguard_setup.py
```

This creates:
- `.claude/settings.json` with PyGuard configuration
- `examples/pyguard_example.py` for reference

### Option B: Manual Integration

Create your Python script:

```python
# my_project.py

from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, HookMatcher
import sys
from pathlib import Path
import asyncio

# Import PyGuard hook
sys.path.insert(0, str(Path(__file__).parent / "bug-detector"))
from pyguard_hook import pyguard_pretool_hook


async def main():
    # Configure Claude with PyGuard
    options = ClaudeAgentOptions(
        hooks={
            'PreToolUse': [
                HookMatcher(
                    matcher='Bash',  # Intercept Bash tool
                    hooks=[pyguard_pretool_hook]
                )
            ]
        },
        allowed_tools=['Bash', 'Write', 'Read', 'Edit'],
        permission_mode='acceptEdits'
    )
    
    # Use Claude Code
    async with ClaudeSDKClient(options=options) as client:
        await client.query("Create a Python script and run it")
        
        async for message in client.receive_response():
            print(message)


if __name__ == "__main__":
    asyncio.run(main())
```

---

## Step 5: See It in Action

### Test Scenario: Claude creates buggy code

```python
async with ClaudeSDKClient(options=options) as client:
    await client.query("""
Create fizzbuzz.py with this code:

def fizzbuzz(max_num):
    for i in range(1, max_num):
        if i%3=0:  # BUG: = instead of ==
            print("fizz")

Then run: python fizzbuzz.py
""")
```

**What happens:**

1. Claude creates `fizzbuzz.py`
2. Claude wants to run `python fizzbuzz.py`
3. **PyGuard intercepts** (PreToolUse hook)
4. **PyGuard validates** the Python file
5. **PyGuard finds error**: Line 3 has `=` instead of `==`
6. **PyGuard blocks** execution with message:
   ```
   🛡️ PyGuard Pre-Runtime Validation Failed
   
   ❌ Line 3: Assignment (=) instead of comparison (==)
      💡 Fix: Change i%3=0 to i%3==0
   ```
7. Claude sees the error and fixes it
8. Claude runs again → PyGuard allows → Success!

---

## Common Usage Patterns

### Pattern 1: Basic Validation

```python
from pyguard_hook import pyguard_pretool_hook

options = ClaudeAgentOptions(
    hooks={'PreToolUse': [HookMatcher(matcher='Bash', hooks=[pyguard_pretool_hook])]}
)
```

### Pattern 2: Multiple Hooks

```python
async def my_custom_hook(input_data, tool_use_id, context):
    # Your custom validation
    return {}

options = ClaudeAgentOptions(
    hooks={
        'PreToolUse': [
            HookMatcher(matcher='Bash', hooks=[pyguard_pretool_hook, my_custom_hook])
        ]
    }
)
```

### Pattern 3: Conditional Validation

```python
from pyguard_hook import validate_python_code

async def smart_hook(input_data, tool_use_id, context):
    if input_data.get('tool_name') != 'Bash':
        return {}
    
    command = input_data.get('tool_input', {}).get('command', '')
    
    # Only validate for production scripts
    if 'production' in command:
        # Use PyGuard validation
        # ... custom logic
        pass
    
    return {}
```

---

## Configuration

### Project Settings (`.claude/settings.json`)

```json
{
  "pyguard": {
    "enabled": true,
    "check_before_run": true,
    "check_syntax": true,
    "check_static": true,
    "check_patterns": true,
    "auto_suggest_fixes": true
  }
}
```

### Disable PyGuard Temporarily

```python
# Method 1: Remove hook
options = ClaudeAgentOptions(
    hooks={}  # No PyGuard
)

# Method 2: Conditional
import os
use_pyguard = os.getenv('USE_PYGUARD', 'true') == 'true'

options = ClaudeAgentOptions(
    hooks={
        'PreToolUse': [HookMatcher(matcher='Bash', hooks=[pyguard_pretool_hook])]
    } if use_pyguard else {}
)
```

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'claude_agent_sdk'"

```bash
pip3 install -r requirements.txt
```

### "patterns_db.json not found"

```bash
python3 cli.py extract
```

### PyGuard not intercepting

Check:
1. Hook is in `ClaudeAgentOptions.hooks['PreToolUse']`
2. Matcher is set to `'Bash'`
3. Command contains `python`, `python3`, or `py`
4. File path is extractable from command

Debug:
```python
from pyguard_hook import is_python_execution, extract_python_file

command = "python script.py"
print(f"Is Python: {is_python_execution(command)}")
print(f"File: {extract_python_file(command)}")
```

### Hook not blocking buggy code

Test validation directly:
```python
from pyguard_hook import validate_python_code

code = """
def test():
    if x=5:
        print("test")
"""

issues = validate_python_code(code, "test.py")
print(issues)
```

---

## Next Steps

1. **Read Full Docs**: [PYGUARD_README.md](./PYGUARD_README.md)
2. **Try Examples**: 
   - `examples/basic_usage.py` - Full integration
   - `examples/test_local_validation.py` - Testing
3. **Contribute Patterns**: Add bugs to `/patterns` directory
4. **Customize**: Modify `pyguard_hook.py` for your needs

---

## Quick Reference

### Test Locally (No Claude)
```bash
python3 examples/test_local_validation.py
```

### Extract Patterns
```bash
python3 cli.py extract
```

### Setup PyGuard
```bash
python3 pyguard_setup.py
```

### Basic Integration
```python
from pyguard_hook import pyguard_pretool_hook

options = ClaudeAgentOptions(
    hooks={'PreToolUse': [HookMatcher(matcher='Bash', hooks=[pyguard_pretool_hook])]}
)
```

---

## Support

- **Documentation**: [PYGUARD_README.md](./PYGUARD_README.md)
- **Update Notes**: [UPDATE_SUMMARY.md](./UPDATE_SUMMARY.md)
- **Examples**: `examples/` directory
- **Issues**: Check validation with `test_local_validation.py`

---

**🎉 You're ready to use PyGuard! Happy coding with pre-runtime validation!**
