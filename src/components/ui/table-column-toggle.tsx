"use client"

import * as React from "react"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"

interface Column {
  id: string
  label: string
}

interface TableColumnToggleProps {
  columns: Column[]
  visibleColumns: string[]
  onColumnToggle: (columnId: string) => void
}

export function TableColumnToggle({
  columns,
  visibleColumns,
  onColumnToggle,
}: TableColumnToggleProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-8 px-3 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all whitespace-nowrap shadow-xs cursor-pointer">
          <Settings2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          Columns
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={visibleColumns.includes(column.id)}
            onCheckedChange={() => onColumnToggle(column.id)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
