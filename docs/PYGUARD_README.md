# 🛡️ PyGuard - Pre-Runtime Python Validation

**Catch Python errors before they run!**

PyGuard is a PreToolUse hook for Claude Code that validates Python code BEFORE execution, catching syntax errors, common bugs, and known patterns early in the development cycle.

## What is PyGuard?

PyGuard intercepts Claude Code's `Bash` tool when it tries to run Python scripts (`python script.py`) and performs three levels of validation:

1. **Syntax Check** (Fast - <10ms) - AST parsing for syntax errors
2. **Static Analysis** (Medium - <100ms) - Common bugs like `=` vs `==`
3. **Pattern Matching** (Slower - <500ms) - Compare against known bug patterns

If issues are found, PyGuard blocks execution and suggests fixes. Claude can then fix the issues before running.

## Why Use PyGuard?

✅ **Catch Errors Early** - Before wasting time on runtime errors  
✅ **Educational** - Learn from pattern-matched bug examples  
✅ **Seamless** - Integrated into Claude Code workflow  
✅ **Fast** - Most checks complete in milliseconds  
✅ **Non-Blocking** - Can override if needed  

## Quick Start

### 1. Install

```bash
cd bug-detector
python3 pyguard_setup.py
```

This creates `.claude/settings.json` and example files.

### 2. Use in Your Code

```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, HookMatcher
from pyguard_hook import pyguard_pretool_hook
import asyncio

async def main():
    # Configure Claude with PyGuard
    options = ClaudeAgentOptions(
        hooks={
            'PreToolUse': [
                HookMatcher(
                    matcher='Bash',
                    hooks=[pyguard_pretool_hook]
                )
            ]
        },
        allowed_tools=['Bash', 'Write', 'Read', 'Edit']
    )
    
    async with ClaudeSDKClient(options=options) as client:
        await client.query("Create and run a fizzbuzz script")
        
        async for message in client.receive_response():
            print(message)

asyncio.run(main())
```

### 3. Test It

```bash
# Test validation without Claude Code
python3 examples/test_local_validation.py

# Test with Claude Code (requires authentication)
python3 examples/basic_usage.py
```

## How It Works

### Scenario: Claude tries to run buggy code

```
User: "Create and run a fizzbuzz script"

Claude: [Creates fizzbuzz.py with bug: i%3=0]

Claude: [Wants to execute: python fizzbuzz.py]

PyGuard Hook: [INTERCEPTS BEFORE EXECUTION]
  
  🛡️ PyGuard Pre-Runtime Validation Failed
  
  ❌ Found 1 error(s):
  
    Line 14: Possible assignment (=) instead of comparison (==) in conditional
      Code: if i%3=0 and i%5==0:
      💡 Fix: Change = to == for comparison
  
  Please fix these issues before running.

Claude: "I found an error. Let me fix it first."

Claude: [Edits the file to use i%3==0]

Claude: [Runs: python fizzbuzz.py]

PyGuard Hook: [ALLOWS - no issues detected]

Output: [Successful execution! 🎉]
```

## What PyGuard Detects

### Syntax Errors (Tier 1)
- Missing colons after `if`, `for`, `def`, etc.
- Unclosed quotes or parentheses
- Invalid indentation
- Assignment `=` in conditionals (should be `==`)

### Static Analysis (Tier 2)
- Comparison errors (`=` vs `==`)
- Missing function parameters
- Undefined variables (basic check)
- Missing return statements

### Pattern Matching (Tier 3)
- Code similar to 13+ known bug patterns
- Warnings with links to examples
- Suggests reviewing similar cases

## Configuration

Edit `.claude/settings.json`:

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

## Examples

### Example 1: Basic Usage
```bash
python3 examples/basic_usage.py
```

### Example 2: Local Validation (No Claude Code needed)
```bash
python3 examples/test_local_validation.py
```

Output:
```
🧪 Test 1: Syntax Validation
--------------------------------------------------
✓ Detected issues:
🛡️ PyGuard Pre-Runtime Validation Failed

❌ Found 1 error(s):

  Line 4: invalid syntax
    Code: if i%3=0:
    💡 Fix: Use == for comparison instead of = (assignment)
```

## API Reference

### `pyguard_pretool_hook(input_data, tool_use_id, context)`

Main PreToolUse hook function. Add to `ClaudeAgentOptions.hooks`.

**Returns:**
- Empty dict if validation passes
- Dict with `permissionDecision: 'deny'` if issues found

### `validate_python_code(code, file_path)`

Validates Python code through all three tiers.

**Returns:** List of issue dictionaries

### `check_syntax(code, file_path)`

AST-based syntax validation.

### `check_static_analysis(code)`

Static analysis for common bugs.

### `check_pattern_matching(code)`

Match against known bug patterns.

## Project Structure

```
bug-detector/
├── pyguard_hook.py           # Main PreToolUse hook
├── pyguard_setup.py          # Installation script
├── patterns_db.json          # Bug patterns database
├── extract_patterns.py       # Pattern extraction
├── examples/
│   ├── basic_usage.py        # Full Claude Code example
│   └── test_local_validation.py  # Standalone tests
└── .claude/
    └── settings.json         # Project configuration
```

## Troubleshooting

### "Module 'claude_agent_sdk' not found"
```bash
pip3 install -r requirements.txt
```

### "patterns_db.json not found"
```bash
python3 cli.py extract
```

### Hook not triggering
Make sure:
1. Hook is added to `ClaudeAgentOptions.hooks['PreToolUse']`
2. Matcher is set to `'Bash'`
3. Python file path is extractable from command

### False positives
Adjust validation in `pyguard_hook.py` or disable specific checks in `.claude/settings.json`.

## Performance

- **Syntax check:** ~5-10ms
- **Static analysis:** ~50-100ms  
- **Pattern matching:** ~200-500ms
- **Total:** Usually <200ms for typical scripts

## Limitations

- Only validates files (not inline `python -c` commands)
- Basic undefined variable detection (not full scope analysis)
- Pattern matching requires patterns_db.json
- Requires readable Python files

## Roadmap

- [ ] VSCode extension integration
- [ ] Pre-commit hook support
- [ ] More advanced static analysis (imports, types)
- [ ] Custom rule configuration
- [ ] Web dashboard for pattern analytics

## Contributing

Found a bug? Have a pattern to add?

1. Add pattern to `/patterns` directory
2. Run `python3 cli.py extract`
3. Test with `python3 examples/test_local_validation.py`

## License

MIT - Use freely in your projects!

---

**Built with ❤️ for Claude Code users who want to catch bugs early!**
