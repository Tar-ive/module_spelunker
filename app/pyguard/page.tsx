"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CodeRain } from "@/components/pyguard/code-rain"
import { TerminalHeader } from "@/components/pyguard/terminal-header"
import { TerminalFooter } from "@/components/pyguard/terminal-footer"
import { PyGuardTerminal } from "@/components/pyguard/pyguard-terminal"

export default function PyGuardPage() {
  const [showHeaderFooter, setShowHeaderFooter] = useState(true)

  const handleExitTriggered = (isExiting: boolean) => {
    setShowHeaderFooter(!isExiting)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060f] text-white">
      <CodeRain />

      <div className="relative z-10">
        <TerminalHeader isVisible={showHeaderFooter} />
        
        {showHeaderFooter && (
          <div className="mx-auto max-w-4xl px-4 pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Module Spelunker
            </Link>
          </div>
        )}

        <PyGuardTerminal onExitTriggered={handleExitTriggered} />
      </div>

      <TerminalFooter isVisible={showHeaderFooter} />
    </main>
  )
}
