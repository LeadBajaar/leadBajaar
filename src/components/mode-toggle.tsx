"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      className="flex items-center justify-center h-9 w-9 rounded-full border border-[var(--crm-border)] hover:bg-[var(--crm-surface-2)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] transition-all"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'} text-base`} aria-hidden="true" />
    </button>
  )
}
