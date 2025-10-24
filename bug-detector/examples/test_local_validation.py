"""
PyGuard Test: Local Validation Without Claude Code

Tests PyGuard's validation functions directly without needing Claude Code running.
Useful for quick testing and development.
"""

import sys
from pathlib import Path

# Add parent directory to import pyguard_hook
sys.path.insert(0, str(Path(__file__).parent.parent))
from pyguard_hook import (
    validate_python_code,
    is_python_execution,
    extract_python_file,
    format_issues_message
)


def test_syntax_validation():
    """Test syntax error detection."""
    print("🧪 Test 1: Syntax Validation")
    print("-" * 50)
    
    buggy_code = """
def fizzbuzz(max_num):
    for i in range(1, max_num):
        if i%3=0:
            print("fizz")
"""
    
    issues = validate_python_code(buggy_code, "test.py")
    
    if issues:
        print("✓ Detected issues:")
        print(format_issues_message(issues))
    else:
        print("✗ No issues detected (expected to find syntax error)")
    
    print()


def test_static_analysis():
    """Test static analysis detection."""
    print("🧪 Test 2: Static Analysis")
    print("-" * 50)
    
    buggy_code = """
def fizzbuzz(max_num)
    for i in range(1, max_num):
        if i%3==0:
            print("fizz")
"""
    
    issues = validate_python_code(buggy_code, "test.py")
    
    if issues:
        print("✓ Detected issues:")
        print(format_issues_message(issues))
    else:
        print("✗ No issues detected (expected to find missing colon)")
    
    print()


def test_valid_code():
    """Test with valid Python code."""
    print("🧪 Test 3: Valid Code")
    print("-" * 50)
    
    valid_code = """
def fizzbuzz(max_num):
    for i in range(1, max_num):
        if i % 3 == 0 and i % 5 == 0:
            print(i, "fizzbuzz")
        elif i % 3 == 0:
            print(i, "fizz")
        elif i % 5 == 0:
            print(i, "buzz")

fizzbuzz(100)
"""
    
    issues = validate_python_code(valid_code, "test.py")
    
    if issues:
        print("✗ Detected issues (expected none):")
        print(format_issues_message(issues))
    else:
        print("✓ No issues detected - code is valid!")
    
    print()


def test_command_detection():
    """Test Python command detection."""
    print("🧪 Test 4: Command Detection")
    print("-" * 50)
    
    test_commands = [
        ("python script.py", True, "script.py"),
        ("python3 /path/to/file.py", True, "/path/to/file.py"),
        ("py main.py", True, "main.py"),
        ("echo hello", False, None),
        ("npm start", False, None),
        ("python -c 'print(1)'", False, None),  # Inline code
    ]
    
    for cmd, should_detect, expected_file in test_commands:
        is_python = is_python_execution(cmd)
        file_path = extract_python_file(cmd)
        
        status = "✓" if is_python == should_detect else "✗"
        print(f"{status} '{cmd}'")
        print(f"   Is Python: {is_python}, File: {file_path}")
        
        if expected_file and file_path != expected_file:
            print(f"   ⚠️  Expected: {expected_file}")
    
    print()


def main():
    """Run all tests."""
    print("=" * 50)
    print("🛡️  PyGuard Validation Tests")
    print("=" * 50)
    print()
    
    test_syntax_validation()
    test_static_analysis()
    test_valid_code()
    test_command_detection()
    
    print("=" * 50)
    print("✅ Tests complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
