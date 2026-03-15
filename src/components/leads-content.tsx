'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const initialLeads = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'New', source: 'Website' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Contacted', source: 'Referral' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Qualified', source: 'LinkedIn' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'New', source: 'Facebook Ad' },
  { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', status: 'Contacted', source: 'Google Ad' },
]

export function LeadsContent() {
  const [leads] = useState(initialLeads)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (statusFilter === 'all' || lead.status === statusFilter)
  )

  return (
    <CardContent>
      <div className="flex space-x-2 mb-4">
        <div className="flex-1">
          <Label htmlFor="search" className="sr-only">Search</Label>
          <Input
            id="search"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Contacted">Contacted</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
          </SelectContent>
        </Select>
        <Button>Export</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLeads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>{lead.name}</TableCell>
              <TableCell>{lead.email}</TableCell>
              <TableCell>{lead.status}</TableCell>
              <TableCell>{lead.source}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="mr-2">Edit</Button>
                <Button variant="ghost" size="sm">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  )
} 
