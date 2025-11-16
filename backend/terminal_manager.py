"""Command execution manager with async streaming."""

import asyncio
import os
import signal
from pathlib import Path
from typing import AsyncIterator


class TerminalManager:
    """Manages command execution with streaming output."""
    
    def __init__(self, working_dir: str = "/app/bug-detector"):
        self.working_dir = Path(working_dir)
        self.timeout = 60  # 60 seconds (Claude API is slow)
    
    async def execute_command(self, command: str) -> AsyncIterator[str]:
        """
        Execute command and stream output line-by-line.
        
        Yields:
            str: Lines of output as they're produced
        """
        # Handle built-in commands
        if command.strip() == "clear":
            yield "CLEAR_SCREEN"
            return
        
        if command.strip() == "help":
            help_text = [
                '<span class="text-cyan-400 font-bold">PyGuard Terminal - Available Commands:</span>',
                '',
                '<span class="text-yellow-400">PyGuard Commands:</span>',
                '  <span class="text-green-300">pyguard --help</span>         - Show PyGuard CLI help',
                '  <span class="text-green-300">pyguard extract</span>        - Extract bug patterns from /patterns',
                '  <span class="text-green-300">pyguard fix</span>            - Fix bugs in Python code',
                '  <span class="text-green-300">pyguard analyze</span>        - Analyze code for bugs',
                '  <span class="text-green-300">pyguard list-patterns</span>  - List known bug patterns',
                '',
                '<span class="text-yellow-400">Terminal Commands:</span>',
                '  <span class="text-green-300">clear</span>                  - Clear terminal screen',
                '  <span class="text-green-300">ls</span>                     - List files in current directory',
                '  <span class="text-green-300">pwd</span>                    - Print working directory',
                '  <span class="text-green-300">cat [file]</span>             - Display file contents',
                '',
                '<span class="text-cyan-400">Examples:</span>',
                '  <span class="text-gray-400">pyguard fix --code "def test(): pass"</span>',
                '  <span class="text-gray-400">pyguard analyze --file sample.py</span>',
                '  <span class="text-gray-400">ls</span>',
                '',
                '<span class="text-yellow-400">Note:</span> <span class="text-white">Only PyGuard commands are allowed. Other commands are blocked for security.</span>',
            ]
            for line in help_text:
                yield line
            return
        
        # Check API key for pyguard fix/analyze
        if "pyguard fix" in command or "pyguard analyze" in command:
            if not os.getenv("ANTHROPIC_API_KEY"):
                yield '<span class="text-red-400">❌ Error: ANTHROPIC_API_KEY not configured on server</span>'
                yield '<span class="text-yellow-400">💡 Contact admin to configure API key</span>'
                return
        
        # Prepare command
        cmd_parts = command.split()
        
        try:
            # Execute command with subprocess
            process = await asyncio.create_subprocess_exec(
                *cmd_parts,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.working_dir,
                env={**os.environ}  # Pass through environment variables
            )
            
            # Stream both stdout and stderr
            async def read_stream(stream, is_stderr=False):
                """Read from stream line by line."""
                while True:
                    line = await stream.readline()
                    if not line:
                        break
                    decoded = line.decode('utf-8').rstrip()
                    if decoded:
                        if is_stderr:
                            yield f'<span class="text-red-400">{decoded}</span>'
                        else:
                            yield decoded
            
            # Create tasks for both streams
            stdout_task = asyncio.create_task(self._collect_lines(read_stream(process.stdout, False)))
            stderr_task = asyncio.create_task(self._collect_lines(read_stream(process.stderr, True)))
            
            # Wait with timeout
            try:
                # Stream output as it comes
                done = False
                while not done:
                    # Check if process is still running
                    if process.returncode is not None:
                        done = True
                    
                    # Yield any available lines from stdout
                    stdout_lines = await asyncio.wait_for(stdout_task, timeout=0.1) if not stdout_task.done() else []
                    for line in stdout_lines:
                        yield line
                    
                    # Yield any available lines from stderr
                    stderr_lines = await asyncio.wait_for(stderr_task, timeout=0.1) if not stderr_task.done() else []
                    for line in stderr_lines:
                        yield line
                    
                    if not done:
                        await asyncio.sleep(0.1)
                
                # Wait for process to complete with timeout
                await asyncio.wait_for(process.wait(), timeout=self.timeout)
                
            except asyncio.TimeoutError:
                # Kill process on timeout
                try:
                    process.send_signal(signal.SIGTERM)
                    await asyncio.wait_for(process.wait(), timeout=5)
                except:
                    process.kill()
                yield f'<span class="text-red-400">❌ Command timed out after {self.timeout}s</span>'
        
        except FileNotFoundError:
            yield f'<span class="text-red-400">❌ Command not found: {cmd_parts[0]}</span>'
            yield f'<span class="text-yellow-400">💡 Type "help" to see available commands</span>'
        
        except Exception as e:
            yield f'<span class="text-red-400">❌ Error: {str(e)}</span>'
    
    async def _collect_lines(self, stream):
        """Collect all lines from async generator."""
        lines = []
        async for line in stream:
            lines.append(line)
        return lines
