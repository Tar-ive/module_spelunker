# 🛡️ PyGuard Demo Guide

## Quick Demo (3 minutes)

### Option 1: Test Hooks Directly

```bash
cd bug-detector

# Test 1: Python syntax validation
echo '{"tool_name": "Bash", "tool_input": {"command": "python test.py"}}' | .claude/hooks/pre_tool_use.py

# Test 2: Create a buggy file and test
cat > demo_buggy.py << 'EOF'
def test():
    if x=5:  # Bug: = instead of ==
        print("test")
EOF

echo '{"tool_name": "Bash", "tool_input": {"command": "python demo_buggy.py"}}' | .claude/hooks/pre_tool_use.py

# Should output:
# 🛡️ PyGuard: Python validation failed
# ❌ Line 2: invalid syntax
# Exit code: 2

# Test 3: Security check
echo '{"tool_name": "Bash", "tool_input": {"command": "rm -rf /"}}' | .claude/hooks/pre_tool_use.py

# Should output:
# BLOCKED: Dangerous rm command detected
```

### Option 2: Run Validation Tests

```bash
cd bug-detector
python3 examples/test_local_validation.py
```

This runs 4 tests:
- ✅ Syntax validation
- ✅ Static analysis  
- ✅ Valid code passes
- ✅ Command detection

### Option 3: Live Demo with Claude Code

1. **Start Claude Code** in the bug-detector directory:
   ```bash
   cd bug-detector
   claude-code
   ```

2. **Ask Claude** to create and run a buggy script:
   ```
   Create a file called demo.py with this code:
   
   def fizzbuzz(n):
       for i in range(n):
           if i%3=0:
               print("fizz")
   
   Then run: python demo.py
   ```

3. **Watch PyGuard block it** before execution!

4. **Claude will fix it** and run successfully.

## What You'll See

### Syntax Error Demo
```
Input: python script.py (with i%3=0)

Output:
🛡️ PyGuard: Python validation failed

❌ Line 3: invalid syntax
   Code: if i%3=0:
   
Fix these errors before running the script.
Exit code: 2
```

### Security Demo
```
Input: rm -rf /

Output:
BLOCKED: Dangerous rm command detected
Exit code: 2
```

### Valid Code Demo
```
Input: python valid_script.py

Output:
Exit code: 0 (allowed!)
```

## Full Test Script

Run everything at once:

```bash
cd bug-detector
./test_pyguard.sh
```

(If script doesn't exist, copy from above or run tests manually)
