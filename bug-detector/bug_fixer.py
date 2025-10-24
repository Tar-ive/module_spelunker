"""Bug fixer using Claude Code SDK with custom MCP tools."""

import json
import asyncio
from pathlib import Path
from typing import Any, Dict
from claude_agent_sdk import (
    ClaudeSDKClient,
    ClaudeAgentOptions,
    tool,
    create_sdk_mcp_server,
    AssistantMessage,
    TextBlock,
    ToolUseBlock
)


# Global patterns database
PATTERNS_DB = None


def load_patterns_db(db_path: Path = None) -> Dict:
    """Load patterns database from JSON file."""
    global PATTERNS_DB
    
    if PATTERNS_DB is not None:
        return PATTERNS_DB
    
    if db_path is None:
        db_path = Path(__file__).parent / "patterns_db.json"
    
    if not db_path.exists():
        raise FileNotFoundError(
            f"Patterns database not found at {db_path}. "
            "Run 'python cli.py extract' first to build the database."
        )
    
    with open(db_path, "r", encoding="utf-8") as f:
        PATTERNS_DB = json.load(f)
    
    return PATTERNS_DB


@tool(
    "get_bug_patterns",
    "Get Python bug pattern examples with error messages and buggy code",
    {"limit": int, "error_type": str}
)
async def get_bug_patterns(args: Dict[str, Any]) -> Dict[str, Any]:
    """Return bug pattern examples for few-shot learning."""
    db = load_patterns_db()
    patterns = db["patterns"]
    
    # Filter by error_type if provided
    error_type = args.get("error_type", "")
    if error_type and error_type != "all":
        patterns = [p for p in patterns if error_type.lower() in p["error_type"].lower()]
    
    # Limit number of patterns
    limit = min(args.get("limit", 5), 10)  # Max 10 examples
    patterns = patterns[:limit]
    
    # Format examples
    examples = []
    for i, pattern in enumerate(patterns, 1):
        example = f"""Example {i}: {pattern['error_type']} (Difficulty: {pattern['difficulty']})
Error Message:
{pattern['error_message'][:300]}{'...' if len(pattern['error_message']) > 300 else ''}

Buggy Code:
```python
{pattern['buggy_code'][:500]}{'...' if len(pattern['buggy_code']) > 500 else ''}
```
"""
        examples.append(example)
    
    result_text = f"Found {len(examples)} bug pattern examples:\n\n" + "\n---\n".join(examples)
    
    return {
        "content": [{
            "type": "text",
            "text": result_text
        }]
    }


async def fix_code(buggy_code: str, interactive: bool = False) -> str:
    """
    Fix buggy Python code using Claude Code with bug pattern examples.
    
    Args:
        buggy_code: The buggy Python code to fix
        interactive: If True, maintains conversation for follow-up questions
        
    Returns:
        Fixed Python code as string
    """
    # Create SDK MCP server with bug patterns tool
    patterns_server = create_sdk_mcp_server(
        name="bug_patterns",
        version="1.0.0",
        tools=[get_bug_patterns]
    )
    
    # Configure Claude options
    options = ClaudeAgentOptions(
        mcp_servers={"patterns": patterns_server},
        allowed_tools=["mcp__patterns__get_bug_patterns"],
        system_prompt=(
            "You are an expert Python bug fixer. When given buggy code:\n"
            "1. First call get_bug_patterns tool to see examples of common Python bugs\n"
            "2. Analyze the buggy code and identify the error\n"
            "3. Fix the bug and return ONLY the corrected code in a code block\n"
            "4. After the code, briefly explain what was wrong\n\n"
            "Be concise and precise."
        )
    )
    
    fixed_code = ""
    explanation = ""
    
    async with ClaudeSDKClient(options=options) as client:
        # Send bug fixing request
        prompt = f"""Fix this Python code:

```python
{buggy_code}
```

First use the get_bug_patterns tool to see examples, then fix the code."""

        await client.query(prompt)
        
        # Collect response
        full_response = ""
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        full_response += block.text
                    elif isinstance(block, ToolUseBlock):
                        print(f"🔧 Claude is checking bug patterns...")
        
        # Parse response to extract code
        fixed_code = extract_code_from_response(full_response)
        explanation = full_response
        
        # Interactive mode - allow follow-up questions
        if interactive:
            print("\n" + "="*50)
            print("Interactive mode: Ask follow-up questions (type 'done' to exit)")
            print("="*50 + "\n")
            
            while True:
                user_input = input("\nYou: ").strip()
                if user_input.lower() in ['done', 'exit', 'quit']:
                    break
                
                await client.query(user_input)
                
                response = ""
                async for message in client.receive_response():
                    if isinstance(message, AssistantMessage):
                        for block in message.content:
                            if isinstance(block, TextBlock):
                                response += block.text
                
                print(f"\nClaude: {response}")
    
    return fixed_code if fixed_code else explanation


def extract_code_from_response(response: str) -> str:
    """Extract Python code from Claude's response."""
    # Look for code blocks
    if "```python" in response:
        start = response.find("```python") + len("```python")
        end = response.find("```", start)
        if end != -1:
            return response[start:end].strip()
    elif "```" in response:
        start = response.find("```") + 3
        end = response.find("```", start)
        if end != -1:
            return response[start:end].strip()
    
    # If no code block found, return full response
    return response


async def analyze_code(code: str) -> str:
    """Analyze code for potential bugs without fixing."""
    patterns_server = create_sdk_mcp_server(
        name="bug_patterns",
        version="1.0.0",
        tools=[get_bug_patterns]
    )
    
    options = ClaudeAgentOptions(
        mcp_servers={"patterns": patterns_server},
        allowed_tools=["mcp__patterns__get_bug_patterns"],
        system_prompt=(
            "You are a Python code analyst. Analyze code for bugs and potential issues. "
            "Use get_bug_patterns tool to compare with known bug patterns."
        )
    )
    
    analysis = ""
    
    async with ClaudeSDKClient(options=options) as client:
        prompt = f"""Analyze this Python code for bugs:

```python
{code}
```

Use the get_bug_patterns tool and tell me if there are any bugs."""

        await client.query(prompt)
        
        async for message in client.receive_response():
            if isinstance(message, AssistantMessage):
                for block in message.content:
                    if isinstance(block, TextBlock):
                        analysis += block.text
    
    return analysis
