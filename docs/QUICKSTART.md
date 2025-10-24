# Quick Start Guide

## 1. Prerequisites

### Install Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### Get Groq API Key
1. Visit [console.groq.com](https://console.groq.com/keys)
2. Sign up for a free account
3. Create an API key

## 2. Quick Setup (Automated)

```bash
# Navigate to bug-detector directory
cd bug-detector

# Run installation script
./install.sh
```

## 2b. Manual Setup

```bash
# Navigate to bug-detector directory
cd bug-detector

# Install Python dependencies
pip3 install -r requirements.txt

# Configure API key
cp .env.example .env
# Edit .env and add your GROQ_API_KEY

# Test setup
python3 test_setup.py

# Test OCR with new model
python3 test_groq_ocr.py
```

**Note:** The tool now uses Groq's new vision model: `meta-llama/llama-4-scout-17b-16e-instruct` (the old `llama-3.2-11b-vision-preview` was deprecated).

## 3. Extract Bug Patterns

```bash
python cli.py extract
```

This will:
- Scan all challenge directories in `/patterns`
- Use Groq Vision API to OCR error screenshots
- Build `patterns_db.json` with all bug patterns

## 4. Fix Your First Bug

```bash
# Fix a buggy file from patterns
python cli.py fix --file ../patterns/01_challenge/01_challenge.py

# Or fix inline code
python cli.py fix --code "def test(): print('hello'"
```

## 5. Interactive Mode

Chat with Claude about the fix:
```bash
python cli.py fix --file buggy.py --interactive
```

## Common Commands

```bash
# List all patterns
python cli.py list-patterns

# Analyze code without fixing
python cli.py analyze --file code.py

# Fix and save output
python cli.py fix --file input.py --output fixed.py

# Get help
python cli.py --help
python cli.py fix --help
```

## Example Workflow

```bash
# 1. Extract patterns once
python cli.py extract

# 2. Fix a bug
python cli.py fix --file ../patterns/01_challenge/01_challenge.py

# Output will show:
# - What tool Claude used (get_bug_patterns)
# - The fixed code
# - Explanation of what was fixed
```

## Troubleshooting

### ModuleNotFoundError
```bash
pip install -r requirements.txt
```

### Claude Code not found
```bash
npm install -g @anthropic-ai/claude-code
which claude-code  # Verify installation
```

### GROQ_API_KEY error
Make sure `.env` file exists with valid API key:
```bash
cat .env
# Should show: GROQ_API_KEY=your_actual_key
```

### Patterns database not found
```bash
python cli.py extract  # Run this first
```
