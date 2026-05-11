'use client'

import { useState, useCallback } from 'react'
import { financeApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  FileText, Download, Printer, Table, PieChart,
  Calendar, RefreshCw, Calculator, ShieldCheck,
  TrendingUp, TrendingDown, Users, Receipt,
} from 'lucide-react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0)
}

/** CSV Export Helper */
function exportToCsv(filename: string, rows: any[]) {
  if (!rows || !rows.length) return
  const separator = ','
  const keys = Object.keys(rows[0])
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows.map(row => {
      return keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k]
        cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""')
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`
        return cell
      }).join(separator)
    }).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export default function ReportsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear]   = useState(now.getFullYear())
  const [loading, setLoading] = useState(false)
  const [report, setReport]   = useState<any>(null)
  const [activeTab, setActiveTab] = useState('pl')

  const fetchPlReport = useCallback(async () => {
    try {
      setLoading(true)
      const res = await financeApi.getMonthlyPlReport(month, year)
      setReport(res)
    } catch { toast.error('Failed to load P&L report') }
    finally { setLoading(false) }
  }, [month, year])

  const fetchAnnualReport = useCallback(async () => {
    try {
      setLoading(true)
      const res = await financeApi.getAnnualReport(year)
      setReport(res)
    } catch { toast.error('Failed to load annual report') }
    finally { setLoading(false) }
  }, [year])

  const fetchPayrollReport = useCallback(async () => {
    try {
      setLoading(true)
      const res = await financeApi.getPayrollReport(year)
      setReport(res)
    } catch { toast.error('Failed to load payroll report') }
    finally { setLoading(false) }
  }, [year])

  const fetchGstReport = useCallback(async () => {
    try {
      setLoading(true)
      const res = await financeApi.getGstReport(month, year)
      setReport(res)
    } catch { toast.error('Failed to load GST report') }
    finally { setLoading(false) }
  }, [month, year])

  const handleFetch = () => {
    setReport(null)
    if (activeTab === 'pl') fetchPlReport()
    else if (activeTab === 'annual') fetchAnnualReport()
    else if (activeTab === 'payroll') fetchPayrollReport()
    else if (activeTab === 'gst') fetchGstReport()
  }

  const handleExport = () => {
    if (!report) return
    let rows: any[] = []
    let filename = `report_${activeTab}_${year}.csv`

    if (activeTab === 'pl') {
      rows.push({ Category: 'Revenue: Subscriptions', Amount: report.revenue?.subscription })
      rows.push({ Category: 'Revenue: Adjustments', Amount: report.revenue?.adjustments })
      rows.push({ Category: 'Total Revenue', Amount: report.revenue?.total })
      report.expenses?.by_category?.forEach((c: any) => rows.push({ Category: `Expense: ${c.category}`, Amount: c.total }))
      rows.push({ Category: 'Expense: Payroll', Amount: report.expenses?.payroll })
      rows.push({ Category: 'Total Expenses', Amount: report.expenses?.total })
      rows.push({ Category: 'Net Profit/Loss', Amount: report.pnl?.net_profit_loss })
      filename = `PNL_${MONTHS[month-1]}_${year}.csv`
    } else if (activeTab === 'annual') {
      rows = report.months.map((m: any) => ({
        Month: m.label,
        Revenue: m.revenue,
        Payroll: m.payroll,
        Opex: m.opex,
        Total_Expenses: m.expenses,
        Net_PNL: m.pnl
      }))
      filename = `Annual_Summary_${year}.csv`
    } else if (activeTab === 'payroll') {
      rows = report.employees.map((e: any) => ({
        Employee: e.employee.name,
        Department: e.employee.department,
        Gross_Total: e.gross_total,
        TDS_Total: e.tds_total,
        Bonus_Total: e.bonus_total,
        Net_Total: e.net_total,
        Months_Paid: e.months_paid
      }))
      filename = `Payroll_Report_${year}.csv`
    } else if (activeTab === 'gst') {
      rows = report.expenses.map((e: any) => ({
        Date: e.expense_date,
        Vendor: e.vendor_name,
        GSTIN: e.gstin_vendor,
        Category: e.category?.name,
        Base_Amount: e.amount,
        GST_Amount: e.gst_amount,
        Total: e.amount + e.gst_amount
      }))
      filename = `GST_Report_${MONTHS[month-1]}_${year}.csv`
    }

    exportToCsv(filename, rows)
    toast.success('Report exported to CSV')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-sm text-muted-foreground">Generated statements for accounting and audits</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
            <SelectTrigger className="w-28 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i+1)}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{[2024,2025,2026,2027].map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={handleFetch} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 gap-1">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Generate
          </Button>
          {report && (
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} variant="outline" size="sm" className="h-9 gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm" className="h-9 gap-1">
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="print:hidden">
        <TabsList className="grid grid-cols-4 w-full md:w-[600px] bg-muted/50">
          <TabsTrigger value="pl" className="text-xs">Monthly P&amp;L</TabsTrigger>
          <TabsTrigger value="annual" className="text-xs">Annual Summary</TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs">Payroll (CA)</TabsTrigger>
          <TabsTrigger value="gst" className="text-xs">GST Report</TabsTrigger>
        </TabsList>
      </Tabs>

      {!report && !loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground font-medium">Select parameters and click Generate to view report</p>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      )}

      {report && (
        <div className="print:block">
          {/* ──────────────────────────────────────────────────────────────────
              Monthly P&L Report
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'pl' && (
            <Card className="border-none shadow-none print:shadow-none">
              <CardHeader className="text-center border-b pb-6">
                <div className="flex justify-center mb-2"><TrendingUp className="h-8 w-8 text-indigo-600" /></div>
                <CardTitle className="text-xl">Profit &amp; Loss Statement</CardTitle>
                <p className="text-sm text-muted-foreground">{MONTHS[month-1]} {year}</p>
              </CardHeader>
              <CardContent className="pt-8 px-0 sm:px-6">
                <div className="max-w-3xl mx-auto space-y-8">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-3 w-3" /> Operating Revenue
                    </h3>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="flex justify-between py-2 border-b">
                        <span>Subscription Sales</span><span>{fmt(report.revenue?.subscription)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Adjustments &amp; Fees</span><span>{fmt(report.revenue?.adjustments)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b-2 font-bold text-emerald-600">
                        <span>Total Revenue</span><span>{fmt(report.revenue?.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <TrendingDown className="h-3 w-3" /> Operating Expenses
                    </h3>
                    <div className="space-y-2 text-sm font-mono">
                      {report.expenses?.by_category?.map((cat: any) => (
                        <div key={cat.category} className="flex justify-between py-2 border-b">
                          <span>{cat.category}</span><span>{fmt(cat.total)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 border-b italic text-muted-foreground">
                        <span>Total Operational Opex</span><span>{fmt(report.expenses?.total_opex)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b mt-4 font-semibold">
                        <span>Salaries &amp; Payroll</span><span>{fmt(report.expenses?.payroll)}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b-2 font-bold text-red-500">
                        <span>Total Expenses</span><span>{fmt(report.expenses?.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Summary */}
                  <div className={`p-6 rounded-2xl border-2 ${report.pnl?.is_profitable ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Net {report.pnl?.is_profitable ? 'Profit' : 'Loss'}</p>
                        <p className={`text-4xl font-black mt-1 ${report.pnl?.is_profitable ? 'text-emerald-600' : 'text-red-500'}`}>
                          {fmt(report.pnl?.net_profit_loss)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gross Margin</p>
                        <p className="text-2xl font-bold mt-1">{report.pnl?.gross_margin}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              Annual Summary Report
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'annual' && (
            <Card className="border-none shadow-none">
              <CardHeader className="text-center border-b pb-6">
                <CardTitle className="text-xl">Annual Financial Summary — {year}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">Month</th>
                      <th className="p-3 text-right">Revenue</th>
                      <th className="p-3 text-right">Payroll</th>
                      <th className="p-3 text-right">Opex</th>
                      <th className="p-3 text-right">Net P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.months?.map((m: any) => (
                      <tr key={m.month} className="border-b hover:bg-muted/10">
                        <td className="p-3 font-semibold">{m.label}</td>
                        <td className="p-3 text-right text-emerald-600">{fmt(m.revenue)}</td>
                        <td className="p-3 text-right text-red-500">{fmt(m.payroll)}</td>
                        <td className="p-3 text-right text-red-400">{fmt(m.opex)}</td>
                        <td className={`p-3 text-right font-bold ${m.pnl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmt(m.pnl)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/50 font-black">
                    <tr>
                      <td className="p-3 uppercase">Annual Total</td>
                      <td className="p-3 text-right text-emerald-700">{fmt(report.annual_revenue)}</td>
                      <td colSpan={2}></td>
                      <td className={`p-3 text-right text-xl ${report.annual_pnl >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmt(report.annual_pnl)}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              Payroll (CA) Report
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'payroll' && (
            <Card className="border-none shadow-none">
              <CardHeader className="text-center border-b pb-6">
                <div className="flex justify-center mb-2"><ShieldCheck className="h-8 w-8 text-indigo-600" /></div>
                <CardTitle className="text-xl">Consolidated Payroll Report (TDS Compliance)</CardTitle>
                <p className="text-sm text-muted-foreground">Financial Year {year}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="p-4 border rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Gross</p>
                    <p className="text-lg font-bold">{fmt(report.totals?.gross)}</p>
                  </div>
                  <div className="p-4 border rounded-xl text-center border-red-200 bg-red-50/20">
                    <p className="text-[10px] uppercase font-bold text-red-600">Total TDS</p>
                    <p className="text-lg font-bold text-red-600">{fmt(report.totals?.tds)}</p>
                  </div>
                  <div className="p-4 border rounded-xl text-center">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Bonus</p>
                    <p className="text-lg font-bold text-emerald-600">{fmt(report.totals?.bonus)}</p>
                  </div>
                  <div className="p-4 border rounded-xl text-center bg-indigo-50/20 border-indigo-200">
                    <p className="text-[10px] uppercase font-bold text-indigo-600">Net Disbursed</p>
                    <p className="text-lg font-bold text-indigo-600">{fmt(report.totals?.net)}</p>
                  </div>
                </div>

                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 bg-muted/50">
                      <th className="p-3 text-left">Employee</th>
                      <th className="p-3 text-left">Dept</th>
                      <th className="p-3 text-right">Gross Salary</th>
                      <th className="p-3 text-right">Total TDS</th>
                      <th className="p-3 text-right">Bonus</th>
                      <th className="p-3 text-right">Net Salary</th>
                      <th className="p-3 text-center">Months</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.employees?.map((emp: any) => (
                      <tr key={emp.employee.id} className="border-b hover:bg-muted/10">
                        <td className="p-3">
                          <p className="font-bold">{emp.employee.name}</p>
                          <p className="text-[10px] text-muted-foreground">{emp.employee.email}</p>
                        </td>
                        <td className="p-3 uppercase">{emp.employee.department}</td>
                        <td className="p-3 text-right">{fmt(emp.gross_total)}</td>
                        <td className="p-3 text-right text-red-500 font-semibold">{fmt(emp.tds_total)}</td>
                        <td className="p-3 text-right text-emerald-600">{fmt(emp.bonus_total)}</td>
                        <td className="p-3 text-right font-bold">{fmt(emp.net_total)}</td>
                        <td className="p-3 text-center">{emp.months_paid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              GST Report
          ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'gst' && (
            <Card className="border-none shadow-none">
              <CardHeader className="text-center border-b pb-6">
                <CardTitle className="text-xl">GSTR-2B Reconciliation Report (Expenses)</CardTitle>
                <p className="text-sm text-muted-foreground">{MONTHS[month-1]} {year}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6 p-4 bg-muted/20 rounded-xl border border-dashed">
                  <div className="flex items-center gap-4">
                    <Receipt className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Eligible Input Tax Credit (ITC)</p>
                      <p className="text-2xl font-black text-indigo-600">{fmt(report.total_gst)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Base Taxable Value: {fmt(report.total_base)}</p>
                    <p className="text-[10px] text-muted-foreground">Total Incl. GST: {fmt(report.total_incl_gst)}</p>
                  </div>
                </div>

                <table className="w-full text-[10px] font-mono">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Vendor</th>
                      <th className="p-2 text-left">GSTIN</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-right">Taxable Amt</th>
                      <th className="p-2 text-right font-bold">GST (18%/var)</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.expenses?.map((exp: any) => (
                      <tr key={exp.id} className="border-b hover:bg-muted/10">
                        <td className="p-2">{exp.expense_date}</td>
                        <td className="p-2 font-semibold">{exp.vendor_name}</td>
                        <td className="p-2">{exp.gstin_vendor}</td>
                        <td className="p-2">{exp.category?.name}</td>
                        <td className="p-2 text-right">{fmt(exp.amount)}</td>
                        <td className="p-2 text-right font-bold text-indigo-600">{fmt(exp.gst_amount)}</td>
                        <td className="p-2 text-right">{fmt(exp.amount + exp.gst_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
