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
        <Button variant="outline" size="sm" className="ml-auto">
          <Settings2 className="mr-2 h-4 w-4" />
          Columns
        </Button>
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
