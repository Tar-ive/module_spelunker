#!/usr/bin/env python3
"""
PyGuard Setup - Install PyGuard hook for Claude Code.

This script helps configure PyGuard as a PreToolUse hook in your project.
"""

import json
import sys
from pathlib import Path


def install_pyguard(project_dir: Path = None):
    """
    Install PyGuard configuration for Claude Code.
    
    Creates .claude/settings.json with PyGuard configuration.
    """
    
    if project_dir is None:
        project_dir = Path.cwd()
    
    print("🛡️  PyGuard Setup")
    print("=" * 50)
    print(f"Installing in: {project_dir}\n")
    
    # Create .claude directory
    claude_dir = project_dir / ".claude"
    claude_dir.mkdir(exist_ok=True)
    print(f"✓ Created {claude_dir}")
    
    # Load or create settings.json
    settings_file = claude_dir / "settings.json"
    
    if settings_file.exists():
        print(f"✓ Found existing {settings_file}")
        with open(settings_file, 'r') as f:
            try:
                settings = json.load(f)
            except json.JSONDecodeError:
                settings = {}
    else:
        settings = {}
        print(f"✓ Creating new {settings_file}")
    
    # Add PyGuard configuration
    settings["pyguard"] = {
        "enabled": True,
        "check_before_run": True,
        "check_syntax": True,
        "check_static": True,
        "check_patterns": True,
        "auto_suggest_fixes": True
    }
    
    # Save settings
    with open(settings_file, 'w') as f:
        json.dump(settings, f, indent=2)
    
    print(f"✓ Saved PyGuard configuration\n")
    
    # Create example usage file
    create_example_file(project_dir)
    
    print("=" * 50)
    print("✅ PyGuard installed successfully!\n")
    print("Next steps:")
    print("  1. See examples/pyguard_example.py for usage")
    print("  2. Import pyguard_hook in your Claude Code scripts")
    print("  3. Add PreToolUse hook to ClaudeAgentOptions")
    print("\nTo disable: Set 'enabled': false in .claude/settings.json")


def create_example_file(project_dir: Path):
    """Create an example usage file."""
    
    examples_dir = project_dir / "examples"
    examples_dir.mkdir(exist_ok=True)
    
    example_file = examples_dir / "pyguard_example.py"
    
    example_code = '''"""
Example: Using PyGuard PreToolUse Hook with Claude Code
"""

from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions, HookMatcher
import sys
from pathlib import Path
import asyncio

# Add parent directory to path to import pyguard_hook
sys.path.insert(0, str(Path(__file__).parent.parent))

from pyguard_hook import pyguard_pretool_hook


async def main():
    """Example: Use PyGuard to validate Python before running."""
    
    # Configure Claude Code with PyGuard hook
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
    
    # Use Claude Code with PyGuard protection
    async with ClaudeSDKClient(options=options) as client:
        # Ask Claude to create and run a Python script
        await client.query(
            "Create a simple fizzbuzz.py script and run it to test"
        )
        
        # PyGuard will validate the code before python command runs
        async for message in client.receive_response():
            print(message)


if __name__ == "__main__":
    print("🛡️  PyGuard Example - Pre-Runtime Validation\\n")
    asyncio.run(main())
'''
    
    with open(example_file, 'w') as f:
        f.write(example_code)
    
    print(f"✓ Created {example_file}")


def check_dependencies():
    """Check if required dependencies are installed."""
    print("Checking dependencies...")
    
    missing = []
    
    try:
        import claude_agent_sdk
        print("✓ claude-agent-sdk installed")
    except ImportError:
        missing.append("claude-agent-sdk")
        print("✗ claude-agent-sdk not installed")
    
    if missing:
        print(f"\n⚠️  Missing dependencies: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt")
        return False
    
    print("✓ All dependencies installed\n")
    return True


def main():
    """Main setup function."""
    print()
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Install PyGuard
    install_pyguard()
    
    print("\n🎉 Setup complete! PyGuard is ready to protect your code.\n")


if __name__ == "__main__":
    main()
