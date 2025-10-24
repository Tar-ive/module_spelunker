#!/usr/bin/env python3
"""CLI for Bug Pattern Detector - Claude Code SDK wrapper."""

import asyncio
import sys
from pathlib import Path
import click
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


@click.group()
def cli():
    """Bug Pattern Detector - Fix Python bugs using Claude Code and few-shot learning."""
    pass


@cli.command()
def extract():
    """Extract bug patterns from /patterns directory using Groq Vision OCR."""
    click.echo("🔍 Extracting bug patterns from /patterns directory...\n")
    
    try:
        from extract_patterns import main as extract_main
        extract_main()
    except ImportError as e:
        click.echo(f"❌ Error: Missing dependencies. Run: pip install -r requirements.txt", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option('--file', '-f', type=click.Path(exists=True), help='Path to Python file with bugs')
@click.option('--code', '-c', type=str, help='Inline Python code to fix')
@click.option('--output', '-o', type=click.Path(), help='Output file path for fixed code')
@click.option('--interactive', '-i', is_flag=True, help='Interactive mode - chat with Claude about the fix')
def fix(file, code, output, interactive):
    """Fix bugs in Python code using Claude Code with bug pattern examples."""
    
    if not file and not code:
        click.echo("❌ Error: Provide either --file or --code", err=True)
        sys.exit(1)
    
    # Load buggy code
    if file:
        buggy_code = Path(file).read_text(encoding='utf-8')
        click.echo(f"📂 Loaded code from: {file}\n")
    else:
        buggy_code = code
        click.echo("📝 Using inline code\n")
    
    click.echo("🔧 Fixing bugs using Claude Code...\n")
    
    try:
        from bug_fixer import fix_code
        
        # Run async fix_code function
        fixed = asyncio.run(fix_code(buggy_code, interactive=interactive))
        
        click.echo("\n" + "="*50)
        click.echo("✅ FIXED CODE:")
        click.echo("="*50)
        click.echo(fixed)
        click.echo("="*50)
        
        # Save to output file if specified
        if output:
            Path(output).write_text(fixed, encoding='utf-8')
            click.echo(f"\n💾 Saved fixed code to: {output}")
        
    except FileNotFoundError as e:
        click.echo(f"❌ Error: {e}", err=True)
        click.echo("\n💡 Tip: Run 'python cli.py extract' first to build the patterns database", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        import traceback
        traceback.print_exc()
        sys.exit(1)


@cli.command()
@click.option('--file', '-f', type=click.Path(exists=True), help='Path to Python file to analyze')
@click.option('--code', '-c', type=str, help='Inline Python code to analyze')
def analyze(file, code):
    """Analyze Python code for potential bugs without fixing."""
    
    if not file and not code:
        click.echo("❌ Error: Provide either --file or --code", err=True)
        sys.exit(1)
    
    # Load code
    if file:
        code_to_analyze = Path(file).read_text(encoding='utf-8')
        click.echo(f"📂 Analyzing code from: {file}\n")
    else:
        code_to_analyze = code
        click.echo("📝 Analyzing inline code\n")
    
    click.echo("🔍 Analyzing code for bugs...\n")
    
    try:
        from bug_fixer import analyze_code
        
        analysis = asyncio.run(analyze_code(code_to_analyze))
        
        click.echo("\n" + "="*50)
        click.echo("📊 ANALYSIS:")
        click.echo("="*50)
        click.echo(analysis)
        click.echo("="*50)
        
    except FileNotFoundError as e:
        click.echo(f"❌ Error: {e}", err=True)
        click.echo("\n💡 Tip: Run 'python cli.py extract' first to build the patterns database", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"❌ Error: {e}", err=True)
        sys.exit(1)


@cli.command()
def list_patterns():
    """List all extracted bug patterns."""
    import json
    
    db_path = Path(__file__).parent / "patterns_db.json"
    
    if not db_path.exists():
        click.echo("❌ Error: Patterns database not found", err=True)
        click.echo("💡 Tip: Run 'python cli.py extract' first", err=True)
        sys.exit(1)
    
    with open(db_path) as f:
        db = json.load(f)
    
    click.echo(f"📚 Bug Patterns Database (v{db['version']})\n")
    click.echo(f"Total patterns: {db['total_patterns']}\n")
    
    for pattern in db['patterns']:
        click.echo(f"ID: {pattern['id']}")
        click.echo(f"  Error Type: {pattern['error_type']}")
        click.echo(f"  Difficulty: {pattern['difficulty']}")
        click.echo(f"  Source: {pattern['source_file']}")
        click.echo(f"  Error: {pattern['error_message'][:80]}...")
        click.echo()


if __name__ == '__main__':
    cli()
