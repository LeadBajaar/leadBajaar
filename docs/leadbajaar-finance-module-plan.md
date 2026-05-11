# LeadBajaar Super Admin — Finance & Revenue Management Module

> **Scope**: This document covers the complete plan for building an internal Finance Management system inside the LeadBajaar Super Admin panel. It includes two major pillars: (1) Expense & Payroll Management for internal company operations, and (2) Revenue Management for scaling SaaS subscription income. Both are tracked separately but connected in a unified P&L view.

---

## Table of Contents

1. [Module Overview & Architecture](#1-module-overview--architecture)
2. [Database Schema — All Tables](#2-database-schema--all-tables)
3. [Expense Management — Daily & Operational](#3-expense-management--daily--operational)
4. [Payroll & Team Management](#4-payroll--team-management)
5. [Revenue Management](#5-revenue-management)
6. [P&L Dashboard & Analytics](#6-pl-dashboard--analytics)
7. [Reports & Exports](#7-reports--exports)
8. [Notifications & Alerts](#8-notifications--alerts)
9. [Access Control & Audit Log](#9-access-control--audit-log)
10. [Build Phases & Prioritization](#10-build-phases--prioritization)
11. [API Endpoints Reference](#11-api-endpoints-reference)

---

## 1. Module Overview & Architecture

### 1.1 What This Module Does

The Finance Module gives the Super Admin (platform owner) a single place to:

- Track every rupee spent internally — salaries, tools, infra, freelancers, office expenses
- Manage team payroll with monthly payout cycles, payslips, and salary revision history
- Monitor and scale subscription revenue from all client workspaces
- View a real P&L: MRR minus total burn = net profit
- Forecast runway, cash flow, and growth trajectory

### 1.2 Separation of Concerns

| Ledger | What it tracks | Source of truth |
|---|---|---|
| **Revenue ledger** | Money coming IN — client subscriptions, custom adjustments | `subscription_history` (existing) + new `revenue_adjustments` |
| **Expense ledger** | Money going OUT — salaries, tools, infra, ops | `expenses` (new) |
| **Payroll ledger** | Salary specifically — structured per employee per month | `salary_payouts` (new) |
| **P&L view** | Revenue minus all expenses = profit | Computed from above three |

### 1.3 Navigation Structure in Admin Panel

```
Super Admin Panel
└── Finance
    ├── Dashboard (P&L overview)
    ├── Revenue Management
    │   ├── MRR & Subscription Overview
    │   ├── Subscription History Ledger
    │   ├── Plan Configuration
    │   ├── Manual Renewals
    │   ├── Churn Tracker
    │   ├── Upgrade / Downgrade Log
    │   └── Revenue Forecasting
    ├── Expense Tracker
    │   ├── All Expenses
    │   ├── Daily Log View
    │   ├── Recurring Expenses
    │   └── Categories & Budgets
    ├── Payroll
    │   ├── Employees
    │   ├── Monthly Payout Cycle
    │   ├── Salary History
    │   ├── Revisions & Bonuses
    │   └── Payslip Generator
    └── Reports
        ├── Monthly P&L
        ├── Annual Summary
        ├── Cash Flow Forecast
        └── Export (CSV / PDF)
```

---

## 2. Database Schema — All Tables

### 2.1 Employees Table

```sql
CREATE TABLE employees (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    email               VARCHAR(150) UNIQUE NOT NULL,
    phone               VARCHAR(20),
    role                VARCHAR(100),               -- "Backend Developer", "Sales Executive"
    department          ENUM('engineering', 'sales', 'marketing', 'ops', 'management', 'other'),
    employment_type     ENUM('full_time', 'part_time', 'contract', 'freelancer'),
    base_salary         DECIMAL(12, 2) NOT NULL,
    joining_date        DATE NOT NULL,
    relieving_date      DATE NULL,
    is_active           BOOLEAN DEFAULT TRUE,
    pan_number          VARCHAR(20),                -- stored, not encrypted but restricted access
    bank_account        VARCHAR(20),                -- masked on display
    bank_ifsc           VARCHAR(15),
    bank_name           VARCHAR(100),
    upi_id              VARCHAR(100),
    tds_percentage      DECIMAL(5,2) DEFAULT 0.00,
    notes               TEXT,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.2 Salary Payouts Table

```sql
CREATE TABLE salary_payouts (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id     BIGINT UNSIGNED NOT NULL,
    month           TINYINT NOT NULL,               -- 1–12
    year            YEAR NOT NULL,
    gross_salary    DECIMAL(12, 2) NOT NULL,
    tds_deducted    DECIMAL(12, 2) DEFAULT 0.00,
    other_deductions DECIMAL(12, 2) DEFAULT 0.00,
    bonus           DECIMAL(12, 2) DEFAULT 0.00,
    net_salary      DECIMAL(12, 2) NOT NULL,        -- gross + bonus - tds - other_deductions
    payment_mode    ENUM('bank_transfer', 'upi', 'cash', 'cheque'),
    transaction_ref VARCHAR(100),
    paid_at         DATETIME NULL,
    status          ENUM('pending', 'paid', 'hold') DEFAULT 'pending',
    proof_url       VARCHAR(500),                   -- screenshot or UTR upload
    remarks         TEXT,
    created_by      BIGINT UNSIGNED,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE KEY unique_payout (employee_id, month, year)
);
```

### 2.3 Salary Revisions Table

```sql
CREATE TABLE salary_revisions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id     BIGINT UNSIGNED NOT NULL,
    old_salary      DECIMAL(12, 2) NOT NULL,
    new_salary      DECIMAL(12, 2) NOT NULL,
    hike_percentage DECIMAL(5, 2),                  -- auto-calculated
    effective_date  DATE NOT NULL,
    reason          VARCHAR(255),                   -- "Annual appraisal", "Promotion", "Market correction"
    revised_by      BIGINT UNSIGNED,
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
```

### 2.4 Expense Categories Table

```sql
CREATE TABLE expense_categories (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,           -- "AWS / Cloud", "SaaS Tools", "Marketing"
    slug            VARCHAR(100) UNIQUE,
    color           VARCHAR(7) DEFAULT '#6B7280',    -- hex color for UI
    icon            VARCHAR(50),                     -- icon class or identifier
    monthly_budget  DECIMAL(12, 2) NULL,             -- NULL = no budget set
    is_active       BOOLEAN DEFAULT TRUE,
    sort_order      INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Default categories to seed on installation:

| Name | Examples |
|---|---|
| Cloud & Infra | AWS, GCP, Vercel, Railway, Cloudflare |
| SaaS Tools | Postman, GitHub, Figma, Notion, Slack |
| Meta / API Costs | WhatsApp API, Meta Ads, ElevenLabs |
| Marketing | Google Ads, content, design |
| Freelancer / Agency | Contractor invoices, outsourcing |
| Legal & Compliance | CA fees, GST filing, trademark |
| Office & Admin | Rent, stationery, electricity |
| Travel & Logistics | Team travel, courier |
| Miscellaneous | Anything not categorised above |

### 2.5 Expenses Table

```sql
CREATE TABLE expenses (
    id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    expense_date        DATE NOT NULL,
    amount              DECIMAL(12, 2) NOT NULL,
    category_id         BIGINT UNSIGNED NOT NULL,
    description         VARCHAR(500) NOT NULL,
    vendor_name         VARCHAR(200),                -- "Amazon Web Services", "OpenAI"
    paid_by             ENUM('company_card', 'upi', 'bank_transfer', 'cash', 'reimbursement'),
    payment_ref         VARCHAR(200),
    is_recurring        BOOLEAN DEFAULT FALSE,
    recurring_cycle     ENUM('monthly', 'quarterly', 'yearly') NULL,
    next_due_date       DATE NULL,
    gst_applicable      BOOLEAN DEFAULT FALSE,
    gst_amount          DECIMAL(12, 2) DEFAULT 0.00,
    gstin_vendor        VARCHAR(20),                 -- for input credit tracking
    receipt_url         VARCHAR(500),
    department          ENUM('engineering', 'sales', 'marketing', 'ops', 'management', 'shared'),
    approved_by         BIGINT UNSIGNED NULL,
    approval_status     ENUM('approved', 'pending', 'rejected') DEFAULT 'approved',
    notes               TEXT,
    created_by          BIGINT UNSIGNED,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES expense_categories(id)
);
```

### 2.6 Revenue Adjustments Table (extends existing subscription_history)

```sql
CREATE TABLE revenue_adjustments (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id      BIGINT UNSIGNED NOT NULL,        -- references your companies/workspaces table
    type            ENUM('one_time_fee', 'setup_charge', 'custom_plan', 'refund', 'discount', 'credit'),
    amount          DECIMAL(12, 2) NOT NULL,          -- negative for refunds/discounts
    description     VARCHAR(500),
    invoice_url     VARCHAR(500),
    effective_date  DATE NOT NULL,
    recorded_by     BIGINT UNSIGNED,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.7 Plan Pricing History Table

```sql
CREATE TABLE plan_pricing_history (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plan_name       ENUM('starter', 'pro', 'enterprise') NOT NULL,
    old_price       DECIMAL(10, 2),
    new_price       DECIMAL(10, 2) NOT NULL,
    changed_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by      BIGINT UNSIGNED,
    notes           VARCHAR(300)
);
```

### 2.8 Revenue Targets Table

```sql
CREATE TABLE revenue_targets (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    month           TINYINT NOT NULL,
    year            YEAR NOT NULL,
    mrr_target      DECIMAL(12, 2),
    new_clients_target INT,
    churn_target    DECIMAL(5, 2),                   -- acceptable churn % for the month
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_target (month, year)
);
```

### 2.9 Churn Log Table

```sql
CREATE TABLE churn_log (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_id      BIGINT UNSIGNED NOT NULL,
    plan            ENUM('starter', 'pro', 'enterprise'),
    monthly_value   DECIMAL(10, 2),                  -- revenue lost
    churned_at      DATE NOT NULL,
    reason          ENUM('non_renewal', 'cancelled', 'expired', 'downgraded', 'refunded', 'other'),
    reason_notes    TEXT,
    reactivated_at  DATE NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Expense Management — Daily & Operational

### 3.1 Expense Entry Form

Every expense logged must capture:

- **Date** — the actual expense date (not creation date)
- **Amount** — with GST breakdown if applicable
- **Category** — from predefined list, admin can add custom categories
- **Description** — mandatory, minimum 5 characters
- **Vendor name** — who was paid
- **Payment mode** — company card / UPI / bank / cash / reimbursement
- **Payment reference** — UTR, UPI transaction ID, or cheque number
- **Receipt upload** — JPEG/PNG/PDF, stored in file storage (S3 or local)
- **Department** — which team this expense belongs to
- **Recurring flag** — if yes, set cycle (monthly/quarterly/yearly) and next due date
- **GST flag** — if yes, capture GST amount and vendor GSTIN for input credit

### 3.2 Daily Log View

- Calendar UI showing each day of the current month
- Click any date to see all expenses for that day
- Day totals shown on calendar cells — color-coded green (low), amber (medium), red (exceeds daily average)
- Week view option: 7-day strip with per-day totals
- "Today's total" always pinned at top

### 3.3 Expense List View

- Filterable by: date range, category, department, payment mode, recurring/one-time, approval status
- Sortable by: amount (high/low), date (newest/oldest)
- Bulk actions: approve selected, export selected
- Inline edit for description, category, and receipt
- Search by vendor name, description, or reference number

### 3.4 Recurring Expense Management

- Separate tab listing all recurring expenses with their next due dates
- Auto-creates a `pending confirmation` expense entry 3 days before due date
- Admin gets a notification to review and confirm (amount may change — e.g., AWS bill varies)
- Once confirmed, entry is marked active and added to that month's total
- Dashboard shows "upcoming commitments" for next 30 days

### 3.5 Category Budget Tracking

- Each category can have a monthly budget limit set
- Progress bar shown per category: ₹X spent of ₹Y budget
- Visual states: green (under 70%), amber (70–90%), red (over 90%), exceeded (over 100%)
- Alert triggered when category hits 80% and again at 100%
- Categories with no budget set show spend only, no progress bar

### 3.6 Receipt & Document Management

- All uploaded receipts stored with the expense record permanently
- Receipts viewable inline in admin without downloading
- GST-tagged receipts exportable separately for CA / tax filing
- Receipts auto-named: `{category}-{vendor}-{date}-{id}.pdf`

---

## 4. Payroll & Team Management

### 4.1 Employee Profiles

Each employee record stores:

- **Basic info**: name, email, phone, role, department
- **Employment details**: type (full-time / part-time / contract / freelancer), joining date, relieving date (if applicable)
- **Compensation**: base salary, TDS percentage, any fixed allowances
- **Payment info**: bank account (masked on display, full for payout), IFSC, bank name, UPI ID
- **Tax info**: PAN number (restricted access)
- **Status**: active / inactive (soft delete on relieving)

Employee list shows: name, role, department, salary (masked with toggle), joining date, employment type, payout status for current month.

### 4.2 Monthly Payout Cycle

**How the cycle works:**

1. On the 1st of each month, system auto-generates `pending` payout records for all active employees based on their current base salary
2. Admin reviews the list — can edit gross, add bonus, add deductions before marking paid
3. Net pay auto-calculated: `gross_salary + bonus - tds_deducted - other_deductions`
4. Admin marks individual payouts as paid, enters payment reference and date
5. Receipt/proof can be uploaded per payout
6. Month is "closed" when all payouts are marked paid or explicitly put on hold

**Payout dashboard for current month:**

- Total employees: N
- Paid: X
- Pending: Y
- Total payout amount for the month
- Quick-pay button: opens payment modal with pre-filled amount and bank details

### 4.3 Salary Calculation Logic

```
Net Salary = Base Salary
           + Bonus (if any)
           - TDS (base_salary × tds_percentage / 100)
           - Other Deductions (advance recovery, late deduction, etc.)
```

TDS is calculated monthly as `(annual_salary × tax_slab%) / 12`. Admin sets the monthly TDS amount manually per employee (since slab depends on declarations) — system does not auto-compute income tax.

### 4.4 Salary History Ledger

- Full history of every payout for every employee
- Filterable by employee, month/year, payment status
- Shows: gross, TDS, other deductions, bonus, net, payment mode, date paid, reference
- Total payout per month across all employees shown at the bottom
- Year total: total salary burn for the financial year

### 4.5 Salary Revisions & Hike Tracking

- Log a revision: select employee, enter new salary, set effective date, add reason
- System auto-calculates hike percentage: `((new - old) / old) × 100`
- Revision history shown per employee in their profile timeline
- Future-dated revisions supported: entered now, takes effect on a future date
- System applies new salary starting from the effective month in payout generation

### 4.6 Bonuses & One-Time Payments

- Bonus can be added at payout time (included in that month's `salary_payouts` record)
- Or logged as a separate one-time payment outside the salary cycle
- Types: performance bonus, festival bonus, project completion incentive, referral bonus
- Bonus history shown in employee profile and included in annual salary cost totals

### 4.7 Payslip Generator

- PDF payslip generated per employee per month on demand
- Template includes: company name/logo, employee name, designation, month-year, earnings breakdown, deductions breakdown, net pay, payment mode
- Downloadable by admin
- Optional: email payslip directly to employee's registered email
- Payslips stored permanently and re-downloadable from salary history

### 4.8 Headcount & Cost Analytics

- Total monthly salary burn chart (trailing 12 months)
- Per-department salary split — engineering vs sales vs ops
- Revenue per employee: `MRR ÷ active_headcount` — key SaaS efficiency metric
- Salary as % of revenue: shows leverage trend as company scales
- New hire cost impact: when adding an employee, show projected burn increase

---

## 5. Revenue Management

### 5.1 MRR Overview Dashboard

Real-time MRR breakdown:

```
MRR = (Pro count × Pro price)
    + (Enterprise count × Enterprise price)
    + (Starter count × Starter price)
    + (Custom adjustments this month)
    - (Refunds / credits this month)
```

Dashboard cards:
- **Total MRR** — current month
- **MRR Growth** — vs last month (absolute + percentage)
- **New MRR** — from new signups this month
- **Expansion MRR** — from upgrades
- **Churned MRR** — from cancellations / expired workspaces
- **Net MRR Movement** — New + Expansion - Churned

### 5.2 Subscription Overview

Live table of all company workspaces with:

- Company name
- Plan (Starter / Pro / Enterprise)
- Subscription amount (plan price or custom)
- Start date, expiry date
- Days remaining (color-coded: green 30+, amber 7–30, red <7, grey expired)
- Auto-renewal status
- Last payment date
- Actions: renew, upgrade, downgrade, view history, add note

**Filters**: plan type, expiry range, days remaining, active/expired/all

**Bulk actions**: renew selected (extend by 30 days), export list, send renewal reminders

### 5.3 Subscription History Ledger

Complete audit trail of every billing event:

- Company name
- Event type: new subscription, renewal, upgrade, downgrade, custom charge, refund, discount
- Plan
- Amount
- Date
- Recorded by (admin who made the entry)
- Notes

Searchable, filterable by company, event type, date range, plan. Exportable to CSV.

### 5.4 Manual Renewal Tool

Admin can manually extend any workspace subscription:

- Select company
- Choose extension: +30 days / +60 days / +90 days / +1 year / custom date
- Set amount charged (or mark as free extension / promo)
- Add note (reason for extension)
- System updates `expires_at` in the workspace/companies table
- Logs entry in `subscription_history` with type = 'renewal'

Use cases: grace period for delayed payments, promotional extensions, error corrections, complimentary access for a referral partner.

### 5.5 Plan Configuration

Admin can update plan prices at any time:

- Current prices shown with last-changed date
- Enter new price → save → system logs old and new price in `plan_pricing_history`
- MRR recalculates immediately using new price × active count
- Price change does NOT retroactively affect past `subscription_history` records
- Historical MRR reports use the price that was active at that time (from `plan_pricing_history`)

Plan configuration also includes:
- Plan feature limits (leads per month, users per workspace, API calls) — shown for reference
- Plan display names and descriptions (used in client-facing upgrade prompts)
- Trial period settings (days of free trial for new signups)

### 5.6 Upgrade & Downgrade Tracking

Every plan change is logged:

- Company, from plan, to plan, date, initiated by (client or admin), amount difference
- **Upgrade**: new MRR added — expansion revenue metric
- **Downgrade**: MRR lost — contraction revenue metric
- Summary: total upgrades this month, total downgrades, net MRR impact
- Company upgrade funnel: how many starter → pro → enterprise conversions in trailing 12 months

### 5.7 Churn Management

**Churn log** captures every expired or cancelled workspace:

- Company name, plan, monthly value lost, churn date, reason, notes
- Reasons: non-renewal (most common), explicit cancellation, technical issue, pricing objection, competitor switch, went out of business

**Churn metrics:**

```
Monthly Churn Rate (%) = (Churned companies this month / Total companies start of month) × 100

Revenue Churn (%) = (Churned MRR / MRR start of month) × 100
```

**Churn dashboard:**
- Churn rate chart (last 12 months)
- Average subscription lifetime: `1 / monthly_churn_rate`
- Companies at risk: expiring in next 7 days with no renewal action taken
- Win-back list: expired in last 30 days — for reactivation outreach

**Reactivation tracking**: when a churned company renews, the `churn_log` entry is updated with `reactivated_at` date and win-back is counted as a metric.

### 5.8 Revenue Targets & Actuals

Admin sets monthly targets:

- MRR target for the month
- New client acquisition target
- Acceptable churn rate target

Dashboard shows actuals vs targets with progress bars:
- MRR: ₹X of ₹Y target (Z%)
- New clients: N of M target
- Churn rate: A% vs target B% (green if below target, red if above)

Year-to-date target vs actual summary for annual planning.

### 5.9 Cohort Revenue Analysis

Group clients by the month they signed up and track how their revenue evolves:

- Month 0: starting MRR from that cohort
- Month 1, 2, 3... : retained MRR from same cohort
- Shows retention curves and identifies which signup months had the best LTV

This is a Phase 3 feature. Requires historical data to be meaningful.

### 5.10 Revenue Forecasting

Based on current MRR, growth rate, and churn rate:

```
Projected MRR (next month) = Current MRR
                             × (1 + avg_growth_rate)
                             × (1 - avg_churn_rate)
                             + Expected new MRR (from pipeline)
```

Forecast view:
- 3-month, 6-month, 12-month MRR projection as a line chart
- Scenario modeling: "what if churn drops to 2%" / "what if we add 10 clients/month"
- ARR (Annual Recurring Revenue): `current_MRR × 12` — shown as a headline metric

### 5.11 LTV & Unit Economics

Key SaaS unit economics tracked in the Revenue section:

| Metric | Formula | Target |
|---|---|---|
| **ARPU** | Total MRR / Active clients | — |
| **LTV** | ARPU / Monthly churn rate | — |
| **Payback period** | CAC / ARPU | < 12 months |
| **LTV : CAC ratio** | LTV / CAC | > 3× |
| **Revenue per employee** | MRR / Headcount | — |
| **Gross margin** | (MRR - COGS) / MRR × 100 | > 70% for SaaS |

CAC (Customer Acquisition Cost) is manually entered or derived from marketing expense ÷ new clients acquired.

---

## 6. P&L Dashboard & Analytics

### 6.1 Monthly P&L Statement

```
REVENUE
  Subscription MRR                    ₹X
  One-time / custom charges           ₹X
  Total Revenue                       ₹X

EXPENSES
  Salaries & Payroll                  ₹X
  Cloud & Infrastructure              ₹X
  SaaS Tools                          ₹X
  Marketing & Ads                     ₹X
  Freelancer / Agency                 ₹X
  Legal & Compliance                  ₹X
  Office & Admin                      ₹X
  Miscellaneous                       ₹X
  Total Expenses                      ₹X

NET PROFIT / LOSS                     ₹X
GROSS MARGIN %                        X%
```

The P&L is auto-generated — admin does not manually fill it. It pulls from `subscription_history` (revenue) and `expenses` + `salary_payouts` (costs) for the selected month.

Admin can add manual revenue line items (e.g., consulting income outside the platform) via `revenue_adjustments`.

### 6.2 Key Dashboard Metrics

**Revenue health:**
- Current MRR
- MRR growth MoM %
- Active paying workspaces
- Monthly churn rate

**Cost health:**
- Total monthly burn
- Salary as % of revenue
- Infra cost as % of revenue
- Cost per active workspace

**Profitability:**
- Net profit / loss (₹)
- Net margin %
- Runway (months) = bank balance / monthly burn
- ARR

### 6.3 Burn Rate Analysis

- Fixed burn: salaries + recurring tools + infra (predictable every month)
- Variable burn: ads, freelancers, travel, one-time (changes month to month)
- Fixed vs variable burn chart helps identify cost stability
- Burn trend (trailing 12 months) with regression line showing cost growth rate

### 6.4 Department Cost Centres

Expenses and salaries can be tagged to departments. Cost centre view shows:

- Engineering: server costs + developer salaries + dev tools
- Sales: sales salaries + CRM tools + travel
- Marketing: marketing salaries + ad spend + content tools
- Operations: ops salaries + office + admin

Revenue per cost centre is harder to attribute but can be approximated (e.g., sales cost centre vs new MRR generated).

### 6.5 Cash Flow Forecast

30/60/90 day forward-looking view:

- **Fixed outflows**: upcoming salary cycle, known recurring tool renewals, EMI / rent
- **Expected inflows**: subscriptions due for renewal (with probability weights)
- **Net cash position** = current bank balance + inflows - outflows

Admin inputs current bank balance once, system keeps it roughly updated via logged payouts.

---

## 7. Reports & Exports

### 7.1 Monthly Finance Report

Auto-generated report for each calendar month includes:

- P&L summary
- Revenue breakdown by plan
- New vs churned clients
- Expense breakdown by category
- Salary payout summary
- Top 5 expenses by amount

Downloadable as PDF (formatted) or CSV (raw data).

### 7.2 Annual Finance Summary

For financial year (April–March):

- Month-wise P&L table
- Total revenue, total expenses, net profit for the year
- MRR growth chart (12 months)
- Headcount and salary growth
- Subscription count growth

### 7.3 Payroll Report (for CA / tax filing)

- All salary payouts for a financial year, per employee
- TDS deducted per employee (for Form 16 / 24Q filing reference)
- Total employer cost (salary + any employer PF/ESIC if applicable)
- Exportable as Excel with one sheet per employee

### 7.4 GST Expense Report

- All expenses where `gst_applicable = true`
- Vendor GSTIN, invoice amount, GST amount, date
- Input GST credit summary per month
- Exportable for sharing with CA for GSTR-2B reconciliation

### 7.5 Subscription Revenue Report

- Month-wise MRR table
- Per-company revenue in a date range
- New subscriptions, renewals, churned in a period
- Revenue by plan type (starter / pro / enterprise)
- Custom adjustment entries

---

## 8. Notifications & Alerts

### 8.1 Salary Alerts

| Trigger | Action |
|---|---|
| 1st of each month | Auto-generate pending payouts; alert admin "Salary cycle opened" |
| 5th of month with unpaid salaries | Reminder: "N employees not yet paid" |
| After marking all paid | Confirmation: "Salary cycle for [Month] closed" |

### 8.2 Expense Alerts

| Trigger | Action |
|---|---|
| Category hits 80% of monthly budget | Warning notification |
| Category exceeds 100% of monthly budget | Alert notification |
| Recurring expense due in 3 days | Reminder to confirm or update |
| Single expense > configurable threshold (e.g., ₹50,000) | High-value expense alert |

### 8.3 Revenue Alerts

| Trigger | Action |
|---|---|
| Workspace expiring in 7 days | Alert: client renewal due |
| Workspace expiring in 1 day | Urgent alert |
| Workspace expired with no renewal | Churn registered, alert admin |
| MRR drops > 5% from last month | Revenue decline alert |
| MRR target for month achieved | Goal reached notification |
| New signup | New client notification with plan and value |

### 8.4 Notification Delivery

- In-app notification bell in Super Admin panel
- Email to super admin email address
- Optional: WhatsApp notification via the platform's own WhatsApp integration (self-dogfooding)
- All notifications logged in a `admin_notifications` table with read/unread status

---

## 9. Access Control & Audit Log

### 9.1 Role-Based Access

Since this is an internal admin module, access should be tiered:

| Role | Access |
|---|---|
| **Super Admin** | Full access — all read/write |
| **Finance Manager** | Read + write expenses, payroll. Read revenue. No plan config. |
| **Accountant / CA** | Read-only all finance data. Export access. |
| **Team Lead** | Read own department expenses only |

### 9.2 Sensitive Field Restrictions

- Bank account numbers shown masked by default (`XXXX XXXX 3456`)
- Un-masking requires re-authentication (password confirmation)
- PAN numbers visible only to Super Admin
- Salary amounts visible only to Super Admin and Finance Manager (not team leads)

### 9.3 Audit Log

Every action in the finance module is logged:

```sql
CREATE TABLE finance_audit_log (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    actor_id        BIGINT UNSIGNED NOT NULL,
    action          VARCHAR(100),         -- "expense.created", "salary.marked_paid", "plan.price_updated"
    entity_type     VARCHAR(50),          -- "expense", "salary_payout", "employee"
    entity_id       BIGINT UNSIGNED,
    old_value       JSON,                 -- previous state
    new_value       JSON,                 -- new state
    ip_address      VARCHAR(45),
    user_agent      VARCHAR(300),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Audit log is read-only. No entry can be edited or deleted. Retention: minimum 5 years.

---

## 10. Build Phases & Prioritization

### Phase 1 — Foundation (Weeks 1–3)

**Goal**: Stop tracking finances in spreadsheets. Get the basics working.

- [x] Employee profiles CRUD (name, role, salary, bank details)
- [x] Monthly salary payout cycle — generate, edit, mark paid
- [x] Salary history view per employee
- [x] Expense entry form with categories
- [x] Seed default expense categories
- [x] Daily expense log view
- [x] Basic dashboard: total salary burn, total expenses, MRR (from existing data)
- [x] Database migrations for: `employees`, `salary_payouts`, `expenses`, `expense_categories`

**Deliverable**: Admin can log expenses and manage monthly salary payouts.

### Phase 2 — Intelligence (Weeks 4–7)

**Goal**: Make the data useful. Reports, automation, revenue depth.

- [x] Salary revision history and hike tracking
- [x] Bonus entry at payout time
- [x] Payslip PDF generator
- [x] Recurring expense entries with auto-creation and confirmation flow
- [x] Category budget limits and progress UI
- [x] Monthly P&L auto-generated report
- [x] MRR vs burn line chart (trailing 12 months)
- [x] Churn log — auto-register churned workspaces, manual reason tagging
- [x] Upgrade/downgrade tracking log
- [x] Revenue targets — set targets, track actuals
- [x] `revenue_adjustments` table and UI for one-time charges
- [x] `plan_pricing_history` — log every price change
- [x] Revenue per employee metric
- [x] Department cost centre tagging on expenses

**Deliverable**: Full financial picture. Monthly P&L available on demand. Revenue tracked with growth metrics.

### Phase 3 — Scale (Weeks 8–12+)

**Goal**: Proactive financial management. Forecasting. Tax readiness.

- [x] Cash flow forecast (30/60/90 days)
- [x] Runway calculator with bank balance input
- [x] MRR forecasting with scenario modeling
- [x] Budget alerts (notifications when category hits 80%/100%)
- [x] Cohort revenue analysis
- [x] LTV and unit economics dashboard (ARPU, LTV, payback period)
- [x] GST expense report export
- [x] Payroll report for CA (annual TDS summary)
- [x] Annual finance summary report
- [x] Audit log viewer in admin panel
- [x] WhatsApp alerts for expiring subscriptions
- [x] Role-based access control for Finance Manager / Accountant roles

**Deliverable**: Scalable, audit-ready finance module. CA-friendly exports. Full revenue forecasting.

---

## 11. API Endpoints Reference

All endpoints are prefixed with `/api/super-admin/finance/`.

### Employees

```
GET    /employees                    List all employees
POST   /employees                    Create employee
GET    /employees/{id}               Get employee profile
PUT    /employees/{id}               Update employee
DELETE /employees/{id}               Soft delete (deactivate)
GET    /employees/{id}/salary-history   All payouts for employee
POST   /employees/{id}/revisions     Log salary revision
GET    /employees/{id}/revisions     List salary revisions
```

### Payroll

```
GET    /payroll/cycle/{month}/{year}     Get payout list for a cycle
POST   /payroll/generate/{month}/{year}  Generate pending payouts for all active employees
PUT    /payroll/{payout_id}/mark-paid    Mark single payout as paid
POST   /payroll/{payout_id}/upload-proof Upload payment proof
GET    /payroll/summary/{year}           Annual payout summary
GET    /payroll/{payout_id}/payslip      Generate payslip PDF
```

### Expenses

```
GET    /expenses                     List expenses (filterable)
POST   /expenses                     Create expense entry
GET    /expenses/{id}                Get expense detail
PUT    /expenses/{id}                Update expense
DELETE /expenses/{id}                Delete expense (soft)
POST   /expenses/{id}/upload-receipt Upload receipt
GET    /expenses/recurring           List all recurring expenses
GET    /expenses/daily/{date}        All expenses for a specific date
GET    /expenses/monthly/{month}/{year}  Monthly expense total and breakdown
```

### Categories

```
GET    /categories                   List all expense categories
POST   /categories                   Create category
PUT    /categories/{id}              Update category (name, budget, color)
DELETE /categories/{id}              Deactivate category
GET    /categories/{id}/expenses     Expenses under a category
```

### Revenue

```
GET    /revenue/mrr                  Current MRR breakdown
GET    /revenue/mrr/history          Month-wise MRR (last 12 months)
GET    /revenue/subscriptions        All workspace subscriptions with status
POST   /revenue/renewals             Manual renewal for a company
GET    /revenue/churn                Churn log
POST   /revenue/churn/{id}/reason    Tag churn reason
GET    /revenue/upgrades             Upgrade/downgrade log
GET    /revenue/adjustments          Revenue adjustments list
POST   /revenue/adjustments          Create revenue adjustment
GET    /revenue/targets/{month}/{year}   Get target for a month
POST   /revenue/targets              Set revenue target
PUT    /plans/pricing                Update plan price
GET    /plans/pricing/history        Plan price change log
```

### Reports

```
GET    /reports/pl/{month}/{year}        Monthly P&L
GET    /reports/annual/{year}            Annual summary
GET    /reports/payroll/{year}           Annual payroll for CA
GET    /reports/gst/{month}/{year}       GST expense report
GET    /reports/export?type=csv&...      Generic export endpoint
GET    /reports/forecast                 Cash flow / MRR forecast
```

---

## Summary

This module transforms the LeadBajaar Super Admin from a subscription management panel into a **complete SaaS financial command centre**. The three-phase build ensures you get immediate value (Phase 1) without waiting for the full system, while the architecture is scalable enough to support a team of 50+ and ₹1Cr+ MRR without structural changes.

The key design principle: **revenue and expenses are always connected**. Every decision — hiring a new employee, upgrading infra, changing plan prices — shows its impact on the P&L immediately.
