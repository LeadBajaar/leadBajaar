"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      className="flex items-center justify-center h-10 w-10 rounded-full text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] transition-all bg-transparent hover:bg-transparent"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle theme"
    >
      <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'} text-[22px]`} aria-hidden="true" />
    </button>
  )
}
