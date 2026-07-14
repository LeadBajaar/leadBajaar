'use client'

import React, { useState, useEffect } from 'react'
import { adminApi } from '@/lib/api'
import { RoleGuard } from '@/components/RoleGuard'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ConfirmationModal } from '@/components/shared/ConfirmationModal'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import { Loader2, CheckCircle, CreditCard, Clock, Tag, Settings } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from '@/components/ui/pagination'
import { CouponsTab } from './components/CouponsTab'
import { SettingsTab } from './components/SettingsTab'

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('pending')
  
  // Pending Payments State
  const [pendingPayments, setPendingPayments] = useState<any[]>([])
  const [isPendingLoading, setIsPendingLoading] = useState(true)
  const [isApproving, setIsApproving] = useState<number | null>(null)
  const [pendingPage, setPendingPage] = useState(1)
  const [pendingMeta, setPendingMeta] = useState<any>(null)

  // All Payments State
  const [allPayments, setAllPayments] = useState<any[]>([])
  const [isAllLoading, setIsAllLoading] = useState(true)
  const [allPage, setAllPage] = useState(1)
  const [allMeta, setAllMeta] = useState<any>(null)

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    id: number;
    companyName: string;
    amount: number;
  }>({ isOpen: false, id: 0, companyName: '', amount: 0 })

  const fetchPendingPayments = async () => {
    try {
      setIsPendingLoading(true)
      const res = await adminApi.getPendingPayments(pendingPage, 10)
      setPendingPayments(res.data || [])
      setPendingMeta({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
        from: res.from,
        to: res.to
      })
    } catch (error: any) {
      toast.error('Failed to load pending payments', { description: error.message })
    } finally {
      setIsPendingLoading(false)
    }
  }

  const fetchAllPayments = async () => {
    try {
      setIsAllLoading(true)
      const res = await adminApi.getBilling(allPage, 10)
      setAllPayments(res.data || [])
      setAllMeta({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
        from: res.from,
        to: res.to
      })
    } catch (error: any) {
      toast.error('Failed to load billing history', { description: error.message })
    } finally {
      setIsAllLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingPayments()
    } else {
      fetchAllPayments()
    }
  }, [activeTab, pendingPage, allPage])

  const confirmApprove = (id: number, companyName: string, amount: number) => {
    setConfirmModal({
      isOpen: true,
      id,
      companyName,
      amount
    })
  }

  const handleApprove = async () => {
    const { id } = confirmModal
    if (!id) return
    try {
      setIsApproving(id)
      await adminApi.approvePayment(id)
      toast.success('Payment approved', { description: 'The company account is now active.' })
      setConfirmModal(prev => ({ ...prev, isOpen: false }))
      fetchPendingPayments()
    } catch (error: any) {
      toast.error('Failed to approve payment', { description: error.message })
    } finally {
      setIsApproving(null)
    }
  }

  const refreshData = () => {
    if (activeTab === 'pending') fetchPendingPayments()
    else fetchAllPayments()
  }

  return (
    <RoleGuard allowedTypes={['super_admin']} allowedFeatures={['system_admin']}>
      <div className="flex flex-col flex-1 gap-4 sm:gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--crm-text-primary)]">Payments & Billing</h1>
            <p className="text-[var(--crm-text-secondary)]">Manage custom payments, approvals, and view billing history.</p>
          </div>
          <Button onClick={refreshData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-[var(--crm-surface-1)] border border-[var(--crm-border)] w-full justify-start h-auto p-1 overflow-x-auto no-scrollbar">
            <TabsTrigger 
              value="pending"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] data-[state=active]:bg-[var(--crm-surface-active)] data-[state=active]:text-[var(--crm-text-primary)] data-[state=active]:font-bold data-[state=active]:shadow-sm transition-all"
            >
              <Clock className="w-4 h-4" />
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger 
              value="all"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] data-[state=active]:bg-[var(--crm-surface-active)] data-[state=active]:text-[var(--crm-text-primary)] data-[state=active]:font-bold data-[state=active]:shadow-sm transition-all"
            >
              <CreditCard className="w-4 h-4" />
              All Payments
            </TabsTrigger>
            <TabsTrigger 
              value="coupons"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] data-[state=active]:bg-[var(--crm-surface-active)] data-[state=active]:text-[var(--crm-text-primary)] data-[state=active]:font-bold data-[state=active]:shadow-sm transition-all"
            >
              <Tag className="w-4 h-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-[var(--crm-text-secondary)] hover:text-[var(--crm-text-primary)] data-[state=active]:bg-[var(--crm-surface-active)] data-[state=active]:text-[var(--crm-text-primary)] data-[state=active]:font-bold data-[state=active]:shadow-sm transition-all"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0 outline-none">
            <Card className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-xl ring-1 ring-[var(--crm-border)] overflow-hidden">
              <CardHeader>
                <CardTitle>Payments Awaiting Approval</CardTitle>
                <CardDescription>Accounts will be fully activated upon your approval.</CardDescription>
              </CardHeader>
              <CardContent>
                {isPendingLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-text-secondary)]" />
                  </div>
                ) : pendingPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--crm-text-secondary)]">
                    <CheckCircle className="h-12 w-12 mb-4 text-emerald-500 opacity-50" />
                    <p>No pending payments right now.</p>
                    <p className="text-sm">All caught up!</p>
                  </div>
                ) : (
                  <div className="border border-[var(--crm-border)] rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-[var(--crm-surface-active)]">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingPayments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              {format(new Date(p.created_at), 'MMM dd, yyyy HH:mm')}
                            </TableCell>
                            <TableCell className="font-medium">
                              {p.company?.name || 'Unknown'}
                              {p.company?.status === 'Temporary Active' && (
                                <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500/20 bg-amber-50">
                                  Temp Active
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>₹{p.amount}</TableCell>
                            <TableCell>{p.plan_name}</TableCell>
                            <TableCell className="max-w-[300px] truncate" title={p.notes}>
                              {p.notes}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={() => confirmApprove(p.id, p.company?.name || 'Unknown', p.amount)}
                                disabled={isApproving === p.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {isApproving === p.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Approve'
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {pendingMeta && pendingMeta.last_page > 1 && (
                      <div className="flex items-center justify-between p-4 border-t border-[var(--crm-border)]">
                        <p className="text-sm text-[var(--crm-text-secondary)]">
                          Showing {pendingMeta.from} to {pendingMeta.to} of {pendingMeta.total} entries
                        </p>
                        <Pagination className="justify-end mx-0 w-auto">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (pendingPage > 1) setPendingPage(p => p - 1)
                                }}
                                className={pendingPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            
                            {[...Array(pendingMeta.last_page)].map((_, i) => {
                              const page = i + 1;
                              if (page === 1 || page === pendingMeta.last_page || (page >= pendingPage - 1 && page <= pendingPage + 1)) {
                                return (
                                  <PaginationItem key={page}>
                                    <PaginationLink 
                                      onClick={(e) => { e.preventDefault(); setPendingPage(page); }}
                                      isActive={pendingPage === page}
                                      className="cursor-pointer"
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                              if (page === pendingPage - 2 || page === pendingPage + 2) {
                                return (
                                  <PaginationItem key={page}>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                );
                              }
                              return null;
                            })}

                            <PaginationItem>
                              <PaginationNext 
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (pendingPage < pendingMeta.last_page) setPendingPage(p => p + 1)
                                }}
                                className={pendingPage === pendingMeta.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="mt-0 outline-none">
            <Card className="border-none shadow-sm bg-[var(--crm-surface-1)] rounded-xl ring-1 ring-[var(--crm-border)] overflow-hidden">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>A comprehensive log of all payment transactions.</CardDescription>
              </CardHeader>
              <CardContent>
                {isAllLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[var(--crm-text-secondary)]" />
                  </div>
                ) : allPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-[var(--crm-text-secondary)]">
                    <CheckCircle className="h-12 w-12 mb-4 text-[var(--crm-text-secondary)] opacity-50" />
                    <p>No billing history found.</p>
                  </div>
                ) : (
                  <div className="border border-[var(--crm-border)] rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-[var(--crm-surface-active)]">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Processor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allPayments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(p.created_at), 'MMM dd, yyyy HH:mm')}
                            </TableCell>
                            <TableCell className="font-medium">
                              {p.company?.name || 'Unknown'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-[var(--crm-surface-active)]">
                                {p.type || 'Standard'}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold text-[var(--crm-text-primary)]">
                              ₹{p.amount}
                            </TableCell>
                            <TableCell>
                              {p.status === 'pending' ? (
                                <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-50">Pending</Badge>
                              ) : p.status === 'approved' ? (
                                <Badge variant="outline" className="text-emerald-500 border-green-500/20 bg-green-50">Approved</Badge>
                              ) : (
                                <Badge variant="outline">{p.status || 'Success'}</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-[var(--crm-text-secondary)] text-sm">
                              {p.processor ? p.processor.name : 'System'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {allMeta && allMeta.last_page > 1 && (
                      <div className="flex items-center justify-between p-4 border-t border-[var(--crm-border)]">
                        <p className="text-sm text-[var(--crm-text-secondary)]">
                          Showing {allMeta.from} to {allMeta.to} of {allMeta.total} entries
                        </p>
                        <Pagination className="justify-end mx-0 w-auto">
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious 
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (allPage > 1) setAllPage(p => p - 1)
                                }}
                                className={allPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                            
                            {[...Array(allMeta.last_page)].map((_, i) => {
                              const page = i + 1;
                              if (page === 1 || page === allMeta.last_page || (page >= allPage - 1 && page <= allPage + 1)) {
                                return (
                                  <PaginationItem key={page}>
                                    <PaginationLink 
                                      onClick={(e) => { e.preventDefault(); setAllPage(page); }}
                                      isActive={allPage === page}
                                      className="cursor-pointer"
                                    >
                                      {page}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                              if (page === allPage - 2 || page === allPage + 2) {
                                return (
                                  <PaginationItem key={page}>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                );
                              }
                              return null;
                            })}

                            <PaginationItem>
                              <PaginationNext 
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (allPage < allMeta.last_page) setAllPage(p => p + 1)
                                }}
                                className={allPage === allMeta.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="mt-0 outline-none">
            <CouponsTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 outline-none">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, isOpen: open }))}
        onConfirm={handleApprove}
        title="Approve Payment"
        description={`Are you sure you want to approve the payment of ₹${confirmModal.amount} for ${confirmModal.companyName}? This will fully activate their account.`}
        confirmText="Approve"
        cancelText="Cancel"
        isLoading={!!isApproving}
        variant="success"
      />
    </RoleGuard>
  )
}
