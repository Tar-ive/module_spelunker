"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { WebSocketClient } from "@/lib/websocket-client"

interface PyGuardTerminalProps {
  onExitTriggered?: (isExiting: boolean) => void
}

type ConnectionState = 'connecting' | 'waking' | 'connected' | 'disconnected' | 'error'

export function PyGuardTerminal({ onExitTriggered }: PyGuardTerminalProps) {
  // WebSocket state
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [userInput, setUserInput] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showInputCursor, setShowInputCursor] = useState(true)
  const [showBSOD, setShowBSOD] = useState(false)
  const [isExitSequenceActive, setIsExitSequenceActive] = useState(false)
  const [countdown, setCountdown] = useState(7)
  const [showRestartButton, setShowRestartButton] = useState(false)

  const wsClient = useRef<WebSocketClient | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const exitTimeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearExitTimeouts = () => {
    exitTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    exitTimeoutsRef.current = []
  }

  // Initialize WebSocket connection
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/terminal'
    
    wsClient.current = new WebSocketClient({
      url: wsUrl,
      onMessage: handleWebSocketMessage,
      onStateChange: setConnectionState,
    })
    
    wsClient.current.connect()
    
    return () => {
      wsClient.current?.disconnect()
    }
  }, [])

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'waking':
        setTerminalLines(prev => [
          ...prev,
          '<span class="text-yellow-400 animate-pulse">⏳ Waking up server...</span>',
          '<span class="text-gray-400 text-xs">First connection may take 10-30 seconds</span>',
        ])
        break
      
      case 'ready':
        setTerminalLines(prev => [
          ...prev,
          '<span class="text-green-400">✅ Connected to PyGuard Terminal</span>',
          '<span class="text-cyan-400">Type "help" for available commands</span>',
          '',
        ])
        break
      
      case 'stdout':
        if (message.line === 'CLEAR_SCREEN') {
          setTerminalLines([])
        } else {
          setTerminalLines(prev => [...prev, message.line])
        }
        break
      
      case 'error':
        setTerminalLines(prev => [
          ...prev,
          `<span class="text-red-400">${message.message}</span>`,
        ])
        setIsExecuting(false)
        break
      
      case 'complete':
        setIsExecuting(false)
        setTerminalLines(prev => [...prev, ''])
        break
    }
  }

  const sendCommand = (command: string) => {
    if (!command.trim()) return
    
    // Check for flipthebits easter egg
    const cmd = command.toLowerCase().trim()
    if (cmd === "flipthebits" || cmd === "flipbits" || cmd === "flip") {
      executeExit()
      return
    }
    
    // Show command in terminal
    setTerminalLines(prev => [
      ...prev,
      `<span class="text-cyan-400">$ ${command}</span>`,
    ])
    
    setIsExecuting(true)
    
    // Send to backend
    wsClient.current?.send(command)
    
    // Add to history
    setCommandHistory(prev => [...prev, command])
    setHistoryIndex(-1)
    
    // Clear input
    setUserInput("")
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
    if (isExitSequenceActive || isExecuting) return

    if (e.key === "Enter" && userInput.trim()) {
      sendCommand(userInput.trim())
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

  // Input cursor blink effect
  useEffect(() => {
    const inputCursorTimer = setInterval(() => {
      setShowInputCursor((prev) => !prev)
    }, 100)

    return () => {
      clearInterval(inputCursorTimer)
      clearExitTimeouts()
    }
  }, [])

  useEffect(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (window.innerWidth > 768 && connectionState === 'connected' && !isExitSequenceActive && !isExecuting) {
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
  }, [connectionState, isExitSequenceActive, isExecuting])

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

  // Connection state indicator component
  const renderConnectionState = () => {
    switch (connectionState) {
      case 'connecting':
        return <div className="text-cyan-400 animate-pulse text-xs">🔌 Connecting...</div>
      case 'waking':
        return <div className="text-yellow-400 animate-pulse text-xs">⏳ Waking up...</div>
      case 'connected':
        return <div className="text-green-400 text-xs">● Online</div>
      case 'disconnected':
        return <div className="text-red-400 text-xs">● Offline</div>
      case 'error':
        return <div className="text-red-400 text-xs">❌ Connection Error</div>
    }
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
              <div className="ml-auto">
                {renderConnectionState()}
              </div>
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

                {connectionState === 'connected' && !isExitSequenceActive && (
                  <div className="flex items-center mt-2">
                    <span className="text-green-400 font-bold">$</span>
                    <div className="relative flex-1 ml-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleInputSubmit}
                        disabled={isExecuting}
                        className="bg-transparent border-none outline-none text-muted-foreground font-mono w-full disabled:opacity-50"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder={isExecuting ? "Executing..." : "Type 'help' for commands..."}
                      />
                      <span
                        className={`absolute left-0 top-0 ${showInputCursor && !isExecuting ? "opacity-100 text-green-400 font-bold text-lg" : "opacity-0"} transition-opacity duration-100 pointer-events-none`}
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
