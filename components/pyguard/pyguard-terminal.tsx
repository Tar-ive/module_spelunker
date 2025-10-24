"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface PyGuardTerminalProps {
  onExitTriggered?: (isExiting: boolean) => void
}

const FULL_TEXT = "pyguard - pre-runtime python validation"

export function PyGuardTerminal({ onExitTriggered }: PyGuardTerminalProps) {
  const [displayText, setDisplayText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [isInteractive, setIsInteractive] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [showInputCursor, setShowInputCursor] = useState(true)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showBSOD, setShowBSOD] = useState(false)
  const [isExitSequenceActive, setIsExitSequenceActive] = useState(false)
  const [countdown, setCountdown] = useState(7)
  const [showRestartButton, setShowRestartButton] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const exitTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearExitTimeouts = () => {
    exitTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    exitTimeoutsRef.current = []
  }

  const processCommand = (command: string): string[] => {
    const cmd = command.toLowerCase().trim()
    setTerminalLines([])

    switch (cmd) {
      case "help":
        return [
          '<span class="text-cyan-400 font-bold">PyGuard Commands:</span>',
          '  <span class="text-yellow-400">clear</span>         - <span class="text-gray-400">Clear the terminal screen</span>',
          '  <span class="text-yellow-400">about</span>         - <span class="text-gray-400">About PyGuard</span>',
          '  <span class="text-yellow-400">demo</span>          - <span class="text-gray-400">Run validation demo</span>',
          '  <span class="text-yellow-400">patterns</span>      - <span class="text-gray-400">List bug patterns</span>',
          '  <span class="text-yellow-400">validate</span>      - <span class="text-gray-400">Validate Python code</span>',
          '  <span class="text-yellow-400">features</span>      - <span class="text-gray-400">Show PyGuard features</span>',
          '  <span class="text-yellow-400">flipthebits</span>   - <span class="text-gray-400">Emergency exit protocol</span>',
        ]

      case "clear":
        return ["CLEAR_SCREEN"]

      case "about":
        return [
          '<span class="text-green-400 font-bold">🛡️ PyGuard - Pre-Runtime Python Validation</span>',
          "",
          '<span class="text-cyan-400">Version:</span> <span class="text-white">2.0.0</span>',
          '<span class="text-cyan-400">Architecture:</span> <span class="text-white">Claude Code SDK + MCP Tools + Groq Vision</span>',
          '<span class="text-cyan-400">Purpose:</span> <span class="text-white">Catch Python errors BEFORE execution</span>',
          "",
          '<span class="text-yellow-400">Key Features:</span>',
          '  • <span class="text-green-300">Pre-Runtime Validation</span> - Catches errors before python script.py runs',
          '  • <span class="text-green-300">Three-Tier Checking</span> - Syntax (10ms), Static (100ms), Patterns (500ms)',
          '  • <span class="text-green-300">Pattern Matching</span> - 13+ known Python bug patterns',
          '  • <span class="text-green-300">OCR Support</span> - Extract errors from screenshots via Groq Vision',
          "",
          '<span class="text-cyan-400">Repository:</span> <a href="https://github.com/Tar-ive" target="_blank" class="text-green-300 hover:underline">github.com/Tar-ive</a>',
        ]

      case "demo":
        return [
          '<span class="text-cyan-400">$ pyguard validate sample.py</span>',
          '<span class="text-yellow-400">🔍 Analyzing Python code...</span>',
          "",
          '<span class="text-green-400">✓ Tier 1: Syntax check passed</span> <span class="text-gray-400">(10ms)</span>',
          '<span class="text-red-400">✗ Tier 2: Static analysis found 2 issues</span> <span class="text-gray-400">(100ms)</span>',
          '  <span class="text-orange-400">sample.py:15:12</span> Missing required parameter <span class="text-white">"temperature"</span>',
          '  <span class="text-orange-400">sample.py:23:8</span> Potential <span class="text-red-300">IndexError</span> in list access',
          "",
          '<span class="text-cyan-400">🎯 Tier 3: Pattern match detected</span> <span class="text-gray-400">(500ms)</span>',
          '  <span class="text-white">Pattern:</span> <span class="text-magenta-400">OpenAI SDK misconfiguration</span>',
          '  <span class="text-white">Confidence:</span> <span class="text-green-300">87%</span>',
          '  <span class="text-white">Known issue:</span> <span class="text-cyan-300">GH-1234</span>',
          "",
          '<span class="text-green-400 font-bold">💡 Suggested fix:</span>',
          '<span class="text-white">  client = OpenAI(temperature=0.7, max_tokens=100)</span>',
          "",
          '<span class="text-yellow-400">⏱️ Total validation time: 610ms</span>',
          '<span class="text-red-400 font-bold">❌ Execution blocked - fix issues before running</span>',
        ]

      case "validate":
        return [
          '<span class="text-cyan-400">$ pyguard validate --help</span>',
          "",
          '<span class="text-white">Usage: pyguard validate [OPTIONS] FILE</span>',
          "",
          '<span class="text-yellow-400">Options:</span>',
          '  <span class="text-green-300">--file PATH</span>      Python file to validate',
          '  <span class="text-green-300">--code TEXT</span>      Inline Python code to validate',
          '  <span class="text-green-300">--output PATH</span>    Save fixed code to file',
          '  <span class="text-green-300">--interactive</span>    Interactive mode with Claude',
          "",
          '<span class="text-cyan-400">Examples:</span>',
          '  <span class="text-gray-400">pyguard validate --file script.py</span>',
          '  <span class="text-gray-400">pyguard validate --code "def test(): pass"</span>',
        ]

      case "patterns":
        return [
          '<span class="text-cyan-400 font-bold">📚 Known Bug Patterns Database</span>',
          "",
          '<span class="text-yellow-400">Total patterns:</span> <span class="text-white">13+</span>',
          '<span class="text-yellow-400">Coverage:</span> <span class="text-white">OpenAI SDK, LangChain, Common Python</span>',
          "",
          '<span class="text-green-400">Sample Patterns:</span>',
          '  1. <span class="text-magenta-400">OpenAI API key missing</span> - Confidence: 95%',
          '  2. <span class="text-magenta-400">Temperature out of range [0,2]</span> - Confidence: 92%',
          '  3. <span class="text-magenta-400">Missing required parameters</span> - Confidence: 88%',
          '  4. <span class="text-magenta-400">Type mismatch in function args</span> - Confidence: 85%',
          '  5. <span class="text-magenta-400">Undefined variable reference</span> - Confidence: 90%',
          '  6. <span class="text-magenta-400">IndexError in list access</span> - Confidence: 87%',
          "",
          '<span class="text-cyan-400">Pattern sources:</span>',
          '  • GitHub issues and PRs',
          '  • Stack Overflow threads',
          '  • Production error logs',
          '  • Community bug reports',
        ]

      case "features":
        return [
          '<span class="text-cyan-400 font-bold">⚡ PyGuard Feature Matrix</span>',
          "",
          '<span class="text-green-400">🛡️ Pre-Runtime Validation:</span>',
          '  • Blocks execution until all checks pass',
          '  • No wasted time on runtime errors',
          '  • Educational error messages',
          "",
          '<span class="text-green-400">🔍 Three-Tier Analysis:</span>',
          '  • <span class="text-yellow-400">Tier 1:</span> AST syntax check (~10ms)',
          '  • <span class="text-yellow-400">Tier 2:</span> Static analysis (~100ms)',
          '  • <span class="text-yellow-400">Tier 3:</span> Pattern matching (~500ms)',
          "",
          '<span class="text-green-400">🤖 Claude Integration:</span>',
          '  • PreToolUse hook intercepts execution',
          '  • Auto-fix suggestions via Claude',
          '  • Interactive debugging mode',
          "",
          '<span class="text-green-400">🔗 MCP Tools:</span>',
          '  • Bug pattern examples as few-shot prompts',
          '  • Programmable bug fixing',
          '  • Knowledge base integration',
          "",
          '<span class="text-green-400">📸 OCR Support:</span>',
          '  • Groq Vision API (llama-4-scout-17b)',
          '  • Extract errors from screenshots',
          '  • Multi-modal error detection',
        ]

      case "flipthebits":
      case "flipbits":
      case "flip":
        executeExit()
        return [""]

      default:
        return ['<span class="text-red-400">[COMMAND NOT FOUND]</span> Type <span class="text-yellow-400">help</span> for available commands']
    }
  }

  const executeExit = async () => {
    clearExitTimeouts()
    setIsExitSequenceActive(true)
    setIsInteractive(false)
    onExitTriggered?.(true)
    setTerminalLines([])

    const initialTimeout = setTimeout(async () => {
      const exitSequence = [
        '<span class="text-red-400 font-bold">⚠️ EMERGENCY EXIT PROTOCOL INITIATED...</span>',
        "",
        '<span class="text-cyan-400">$ pyguard --emergency-exit</span>',
        '<span class="text-yellow-400">validation_mode:</span> <span class="text-red-400">DISABLED</span>',
        '<span class="text-yellow-400">safety_checks:</span> <span class="text-red-400">BYPASSED</span>',
        "",
        '<span class="text-cyan-400">$ cat /proc/pyguard_state</span>',
        '<span class="text-red-500 font-bold">KERNEL PANIC:</span> <span class="text-yellow-400">PyGuard validation failed at</span> <span class="text-magenta-400">0xDEADBEEF</span>',
        '<span class="text-red-500 font-bold">BUG:</span> <span class="text-cyan-400">pre-runtime check crashed</span>',
        '<span class="text-green-400">IP:</span> <span class="text-yellow-400">[&lt;ffffffffa0123456&gt;]</span> <span class="text-red-400">pyguard_exit+0x42/0x100</span>',
        "",
        '<span class="text-cyan-400">$ ps aux | grep validation</span>',
        '<span class="text-red-400 font-bold animate-pulse">SYNTAX_CHECK</span> <span class="text-yellow-400 font-bold animate-pulse">TIER_1_FAILURE</span>',
        '<span class="text-magenta-400 font-bold animate-pulse">STATIC_ANALYSIS</span> <span class="text-green-400 font-bold animate-pulse">TIER_2_CRASHED</span>',
        '<span class="text-purple-400 font-bold animate-pulse">PATTERN_MATCH</span> <span class="text-orange-400 font-bold animate-pulse">TIER_3_CORRUPTED</span>',
        "",
        '<span class="text-red-500 font-bold text-xl animate-pulse">CRITICAL: VALIDATION SYSTEM FAILURE</span>',
        '<span class="text-blue-400 font-bold text-lg animate-pulse">BLUE SCREEN IMMINENT...</span>',
      ]

      let lineIndex = 0
      let charIndex = 0

      const typeExitSequence = () => {
        if (lineIndex >= exitSequence.length) {
          const bsodTimeout = setTimeout(() => {
            setShowBSOD(true)
            setCountdown(7)
          }, 500)
          exitTimeoutsRef.current.push(bsodTimeout)
          return
        }

        const currentLine = exitSequence[lineIndex]

        if (charIndex === 0 && currentLine !== "") {
          setTerminalLines((prev) => [...prev, ""])
        }

        if (currentLine === "") {
          setTerminalLines((prev) => [...prev, ""])
          lineIndex++
          charIndex = 0
          setTimeout(typeExitSequence, 25)
          return
        }

        if (charIndex < currentLine.length) {
          const partialLine = currentLine.slice(0, charIndex + 1)
          setTerminalLines((prev) => {
            const newLines = [...prev]
            if (newLines[newLines.length - 1] === "" || charIndex === 0) {
              newLines[newLines.length - 1] = partialLine
            } else {
              newLines[newLines.length - 1] = partialLine
            }
            return newLines
          })
          charIndex++

          const typingSpeed = currentLine.includes("$") ? 2.5 : currentLine.includes("KERNEL PANIC") ? 3.75 : 1.875

          setTimeout(typeExitSequence, typingSpeed)
        } else {
          charIndex = 0
          lineIndex++
          const pauseTime = currentLine.includes("$") ? 25 : currentLine.includes("CRITICAL") ? 37.5 : 12.5
          setTimeout(typeExitSequence, pauseTime)
        }
      }

      typeExitSequence()
    }, 500)
    exitTimeoutsRef.current.push(initialTimeout)
  }

  const handleInputSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isExitSequenceActive) return

    if (e.key === "Enter" && userInput.trim()) {
      const command = userInput.trim()
      const response = processCommand(command)

      setCommandHistory((prev) => [...prev, command])
      setHistoryIndex(-1)

      if (response[0] === "CLEAR_SCREEN") {
        setTerminalLines([])
      } else {
        setTerminalLines((prev) => [...prev, `root@pyguard:~# ${command}`, ...response, ""])
      }

      setUserInput("")

      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setUserInput(commandHistory[newIndex])
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (historyIndex >= 0) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setUserInput("")
        } else {
          setHistoryIndex(newIndex)
          setUserInput(commandHistory[newIndex])
        }
      }
    }
  }

  useEffect(() => {
    const initTerminal = async () => {
      const platform = navigator.platform
      const userAgent = navigator.userAgent

      let lineIndex = 0
      let charIndex = 0

      const typeCharacter = () => {
        const lines = [
          "",
          '<span class="text-cyan-400">$ pyguard --version</span>',
          '<span class="text-green-400">PyGuard v2.0.0</span> - Pre-Runtime Python Validation',
          '<span class="text-gray-400">Powered by Claude Code SDK + Groq Vision API</span>',
          "",
          '<span class="text-cyan-400">$ cat /proc/system_info</span>',
          `<span class="text-yellow-400">platform=</span><span class="text-green-300">"${platform}"</span>`,
          `<span class="text-yellow-400">user_agent=</span><span class="text-green-300">"${userAgent}"</span>`,
          "",
          '<span class="text-cyan-400">$ pyguard status</span>',
          '<span class="text-green-400">✓ Claude Code SDK:</span> <span class="text-white">Connected</span>',
          '<span class="text-green-400">✓ MCP Tools:</span> <span class="text-white">Active</span>',
          '<span class="text-green-400">✓ Groq Vision:</span> <span class="text-white">Ready</span>',
          '<span class="text-green-400">✓ Pattern DB:</span> <span class="text-white">13+ patterns loaded</span>',
          "",
          '<span class="text-yellow-400">💡 Type</span> <span class="text-cyan-400">help</span> <span class="text-yellow-400">to see available commands</span>',
          "",
        ]

        if (lineIndex >= lines.length) {
          setIsInteractive(true)
          return
        }

        const currentLine = lines[lineIndex]

        if (charIndex === 0) {
          setTerminalLines((prev) => [...prev, ""])
        }

        if (charIndex < currentLine.length) {
          const partialLine = currentLine.slice(0, charIndex + 1)
          setTerminalLines((prev) => {
            const newLines = [...prev]
            newLines[newLines.length - 1] = partialLine
            return newLines
          })
          charIndex++

          const typingSpeed = currentLine.startsWith("$") ? 2.5 : Math.random() * 1.25 + 1

          setTimeout(typeCharacter, typingSpeed)
        } else {
          charIndex = 0
          lineIndex++

          const pauseTime = currentLine === "" ? 6.25 : currentLine.startsWith("$") ? 25 : 12.5

          setTimeout(typeCharacter, pauseTime)
        }
      }

      typeCharacter()
    }

    initTerminal()

    let i = 0
    const typeTimer = setInterval(() => {
      if (i < FULL_TEXT.length) {
        setDisplayText(FULL_TEXT.slice(0, i + 1))
        i++
      } else {
        clearInterval(typeTimer)
      }
    }, 4.75)

    const cursorTimer = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 125)

    const inputCursorTimer = setInterval(() => {
      setShowInputCursor((prev) => !prev)
    }, 100)

    return () => {
      clearInterval(typeTimer)
      clearInterval(cursorTimer)
      clearInterval(inputCursorTimer)
      clearExitTimeouts()
    }
  }, [])

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (window.innerWidth > 768 && isInteractive && !isExitSequenceActive) {
        const target = e.target as HTMLElement
        const isInputElement =
          target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.contentEditable === "true"

        if (!isInputElement && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          inputRef.current?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleGlobalKeydown)
    return () => document.removeEventListener("keydown", handleGlobalKeydown)
  }, [isInteractive, isExitSequenceActive])

  useEffect(() => {
    if (showBSOD && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (showBSOD && countdown === 0) {
      setShowRestartButton(true)
    }
  }, [showBSOD, countdown])

  const handleManualRestart = () => {
    window.location.reload()
  }

  if (showBSOD) {
    return (
      <div className="fixed inset-0 bg-blue-600 text-white font-mono flex flex-col justify-center items-start z-50 overflow-auto">
        <div className="w-full p-4 md:p-8 space-y-2 md:space-y-4">
          <div className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">:(</div>

          <div className="text-base md:text-xl mb-1 md:mb-2">
            PyGuard validation system encountered a critical error.
          </div>
          <div className="text-sm md:text-lg mb-2 md:mb-4">
            Collecting error diagnostics, system will restart shortly...
          </div>

          <div className="text-xs md:text-sm space-y-1 md:space-y-2 max-w-full">
            <div className="text-white space-y-1">
              <div>Fatal exception in PyGuard validation module</div>
              <div className="hidden md:block">Process: pyguard_validator PID: 1337 Status: CRASHED</div>
            </div>

            <div className="mt-4 md:mt-6 space-y-2">
              <p className="text-sm md:text-base">Error details:</p>
              <p className="bg-blue-700 p-2 rounded text-xs md:text-sm">Stop code: VALIDATION_SYSTEM_FAILURE</p>
              <p className="bg-blue-700 p-2 rounded text-xs md:text-sm">Component: pyguard_validator.sys</p>

              <div className="mt-4 p-3 bg-blue-800 rounded border border-blue-500 mb-20 md:mb-8">
                <div className="text-yellow-300 font-bold text-sm md:text-base">Restoring validation system...</div>
                {!showRestartButton ? (
                  <>
                    <div className="text-green-400 mt-1 text-sm md:text-base">
                      System restart in: {countdown} seconds
                    </div>
                    <div className="w-full bg-blue-900 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(100, ((7 - countdown) / 7) * 100)}%` }}
                      ></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-green-400 mt-1 text-sm md:text-base">System restoration complete!</div>
                    <div className="w-full bg-blue-900 rounded-full h-2 mt-2 overflow-hidden">
                      <div className="bg-green-400 h-2 rounded-full w-full"></div>
                    </div>
                    <button
                      onClick={handleManualRestart}
                      className="mt-4 px-4 md:px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition-colors duration-200 border-2 border-green-400 text-sm md:text-base"
                    >
                      Restart Terminal
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="flex flex-col justify-start items-center relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg shadow-2xl mb-8 flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20 flex-shrink-0">
              <div className="w-3 h-3 bg-destructive rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="ml-4 text-xs text-muted-foreground font-mono">terminal://pyguard.dev</span>
            </div>

            <div className="p-8 font-mono">
              <div className="text-left space-y-1">
                {terminalLines.map((line, index) => {
                  return (
                    <p
                      key={index}
                      className={
                        line && line.includes("CRITICAL")
                          ? "text-red-400 font-bold"
                          : line && line.startsWith("$")
                            ? "text-green-400"
                            : line && line.startsWith("root@pyguard")
                              ? "text-green-400 font-bold"
                              : line && (line.includes("[COMMAND NOT FOUND]") || line.includes("ERROR"))
                                ? "text-red-400 font-bold"
                                : "text-muted-foreground"
                      }
                      dangerouslySetInnerHTML={{ __html: line }}
                    />
                  )
                })}

                {isInteractive && !isExitSequenceActive && (
                  <div className="flex items-center mt-2">
                    <span className="text-green-400 font-bold">root@pyguard:~#</span>
                    <div className="relative flex-1 ml-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleInputSubmit}
                        className="bg-transparent border-none outline-none text-muted-foreground font-mono w-full"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="Type 'help' for commands..."
                      />
                      <span
                        className={`absolute left-0 top-0 ${showInputCursor ? "opacity-100 text-green-400 font-bold text-lg" : "opacity-0"} transition-opacity duration-100 pointer-events-none`}
                        style={{ left: userInput.length > 0 ? `${userInput.length * 0.6}em` : "0" }}
                      >
                        _
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
