"""
PyGuard Example 1: Basic Usage

Shows how to use PyGuard as a PreToolUse hook to validate Python code
before Claude Code executes it.
"""

from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, HookMatcher
import sys
from pathlib import Path
import asyncio

# Add parent directory to import pyguard_hook
sys.path.insert(0, str(Path(__file__).parent.parent))
from pyguard_hook import pyguard_pretool_hook


async def example_basic():
    """Basic PyGuard usage - validates code before running."""
    
    print("🛡️  PyGuard Example: Basic Usage")
    print("=" * 60)
    print("This example shows PyGuard intercepting buggy Python code\n")
    
    # Configure Claude with PyGuard hook
    options = ClaudeAgentOptions(
        hooks={
            'PreToolUse': [
                HookMatcher(
                    matcher='Bash',  # Only intercept Bash tool
                    hooks=[pyguard_pretool_hook]
                )
            ]
        },
        allowed_tools=['Bash', 'Write', 'Read', 'Edit'],
        permission_mode='acceptEdits',
        cwd=str(Path(__file__).parent)
    )
    
    async with ClaudeSDKClient(options=options) as client:
        # Test 1: Ask Claude to create buggy code
        print("📝 Test 1: Creating buggy fizzbuzz code...")
        await client.query("""
Create a file called buggy_fizzbuzz.py with this code:

```python
def fizzbuzz(max_num):
    for i in range(1, max_num):
        if i%3=0 and i%5==0:
            print(i, "fizzbuzz")
        elif i%3==0:
            print(i, "fizz")
        elif i%5==0:
            print(i, "buzz")

fizzbuzz(20)
```

Then run it with: python buggy_fizzbuzz.py
""")
        
        async for message in client.receive_response():
            print(message)
        
        print("\n" + "=" * 60)
        print("Note: PyGuard should have caught the syntax error (i%3=0)")
        print("      before trying to run the script!\n")


if __name__ == "__main__":
    try:
        asyncio.run(example_basic())
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
