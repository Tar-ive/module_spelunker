# 🛡️ PyGuard - Pre-Runtime Python Validation

> **Catch Python errors before they run!**

PyGuard is a PreToolUse hook for Claude Code that validates Python code BEFORE execution. No more wasted time on runtime errors - catch syntax errors, common bugs, and known patterns early.

**🎯 New in v2.0:** Transformed from CLI tool to seamless Claude Code integration via PreToolUse hooks!

## Features

- 🛡️ **Pre-Runtime Validation**: Catches errors BEFORE `python script.py` executes
- ⚡ **Three-Tier Checking**: Syntax (10ms), Static Analysis (100ms), Patterns (500ms)
- 🔍 **Pattern Matching**: Compare against 13+ known Python bug patterns
- 🤖 **OCR Support**: Uses Groq Vision API to extract error messages from screenshots
- 🔗 **Seamless Integration**: Works as Claude Code PreToolUse hook
- 📊 **Educational**: Shows WHY code won't work with fix suggestions

## Architecture

This tool uses:
- **Claude Code SDK** (`claude-agent-sdk`) - Wraps Claude Code for programmable bug fixing
- **Custom MCP Tools** - Provides bug pattern examples to Claude as few-shot prompts
- **Groq Vision API** - OCR for extracting error messages from screenshots (uses `llama-4-scout-17b-16e-instruct`)
- **Click** - CLI interface

## Installation

### Prerequisites

1. **Claude Code** - Install globally:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **Groq API Key** - Get free API key at [console.groq.com](https://console.groq.com/keys)

### Setup

1. Install dependencies:
   ```bash
   cd bug-detector
   pip install -r requirements.txt
   ```

2. Configure API key:
   ```bash
   cp .env.example .env
   # Edit .env and add your GROQ_API_KEY
   ```

3. Extract bug patterns (run once):
   ```bash
   python cli.py extract
   ```
   This will scan the `/patterns` directory, OCR all error screenshots, and build `patterns_db.json`.

## Usage

### Extract Bug Patterns

Extract patterns from the `/patterns` directory:
```bash
python cli.py extract
```

This creates `patterns_db.json` with all bug patterns.

### Fix Bugs

**Fix a file:**
```bash
python cli.py fix --file path/to/buggy.py
```

**Fix inline code:**
```bash
python cli.py fix --code "def fizzbuzz(): print('test')"
```

**Save fixed code to file:**
```bash
python cli.py fix --file buggy.py --output fixed.py
```

**Interactive mode** (chat with Claude):
```bash
python cli.py fix --file buggy.py --interactive
```

### Analyze Code

Analyze code for potential bugs without fixing:
```bash
python cli.py analyze --file path/to/code.py
```

### List Patterns

View all extracted bug patterns:
```bash
python cli.py list-patterns
```

## Quick Start (PyGuard Hook)

### 1. Setup
```bash
cd bug-detector
python3 pyguard_setup.py
```

### 2. Use in Your Code
```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, HookMatcher
from pyguard_hook import pyguard_pretool_hook

options = ClaudeAgentOptions(
    hooks={
        'PreToolUse': [
            HookMatcher(matcher='Bash', hooks=[pyguard_pretool_hook])
        ]
    }
)

async with ClaudeSDKClient(options=options) as client:
    await client.query("Create and run a Python script")
    # PyGuard validates before execution! 🛡️
```

### 3. Test It
```bash
python3 examples/test_local_validation.py
```

**📖 Full documentation:** See [PYGUARD_README.md](./PYGUARD_README.md)

## How PyGuard Works

1. **Hook Intercepts**: When Claude Code tries to run `python script.py`
2. **Three-Tier Validation**:
   - **Tier 1**: Syntax check via AST parsing (~10ms)
   - **Tier 2**: Static analysis for common bugs (~100ms)
   - **Tier 3**: Pattern matching against known issues (~500ms)
3. **Decision**: 
   - ✅ No issues → Allow execution
   - ❌ Issues found → Block execution, suggest fixes
4. **Claude Fixes**: Claude sees the issues and fixes them before running

## Example

```bash
# Extract patterns first
python cli.py extract

# Fix a buggy file
python cli.py fix --file ../patterns/01_challenge/01_challenge.py

# Output:
# 🔧 Fixing bugs using Claude Code...
# 🔧 Claude is checking bug patterns...
# 
# ================================================
# ✅ FIXED CODE:
# ================================================
# [Fixed Python code here]
# ================================================
```

## Project Structure

```
bug-detector/
├── cli.py                # Click-based CLI interface
├── extract_patterns.py   # Pattern extraction with Groq OCR
├── bug_fixer.py          # Claude SDK wrapper with MCP tools
├── patterns_db.json      # Cached bug patterns (generated)
├── requirements.txt      # Python dependencies
├── .env.example          # Environment template
└── README.md             # This file
```

## Dependencies

- `claude-agent-sdk` - Claude Code SDK for Python
- `groq` - Groq API for Vision OCR
- `python-dotenv` - Environment variable management
- `click` - CLI framework

## Troubleshooting

### "Claude Code not found"
Make sure Claude Code is installed globally:
```bash
npm install -g @anthropic-ai/claude-code
```

### "GROQ_API_KEY not found"
1. Get API key from [console.groq.com](https://console.groq.com/keys)
2. Add to `.env` file: `GROQ_API_KEY=your_key_here`

### "Patterns database not found"
Run the extraction command first:
```bash
python cli.py extract
```

## License

MIT
