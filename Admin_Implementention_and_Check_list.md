# QuickSend Admin — Implementation & Checklist

## Overview
QuickSend Admin is a standalone admin panel for managing the QuickSend platform. It covers user management, KYC review, compliance cases, payout monitoring, and fraud investigation — all with a dark-themed UI.

## Architecture

```
QuickSend-Admin/
├── src/
│   ├── config/           # Environment & constants
│   ├── api/              # Axios client & auth interceptors
│   ├── utils/            # Token management
│   ├── components/ui/    # Reusable dark-theme UI primitives
│   ├── features/admin/   # Domain: types, mock API, Zustand store
│   ├── pages/
│   │   ├── Login.tsx     # Auth entry point
│   │   └── admin/        # 6 protected pages
│   └── routes/           # Guarded router (7 routes)
```

## Tech Stack
- **Framework:** React 19, TypeScript 6
- **Build:** Vite 8, Tailwind CSS 3
- **State:** Zustand 5
- **Routing:** React Router 7
- **Icons:** Lucide React
- **HTTP:** Axios
- **Data:** React Query + Mock API (toggleable via `USE_ADMIN_MOCK`)

---

## Checklist

### 1. Project Configuration
- [x] `package.json` with all dependencies
- [x] `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json`
- [x] `vite.config.ts`
- [x] `tailwind.config.js` / `postcss.config.js`
- [x] `.env` with `VITE_API_URL`
- [x] `index.html` entry point
- [ ] Add ESLint + lint script
- [ ] Add README with setup instructions

### 2. Entry & Infrastructure
- [x] `src/main.tsx` — mounts React with QueryClientProvider
- [x] `src/App.tsx` — renders RouterProvider
- [x] `src/index.css` — Tailwind directives, dark base styles
- [x] `src/vite-env.d.ts` — Vite client types
- [x] `src/config/env.ts` — API URL from `import.meta.env`
- [x] `src/config/constants.ts` — `TOKEN_KEY`
- [x] `src/api/client.ts` — Axios instance
- [x] `src/api/interceptors.ts` — Bearer token injection
- [x] `src/utils/token.ts` — localStorage get/set/clear

### 3. UI Components
- [x] `Card.tsx` — dark theme (`bg-slate-800/50`, `border-slate-700/50`)
- [x] `Button.tsx` — 5 variants (primary, secondary, danger, success, ghost), 2 sizes (sm, md), loading spinner
- [x] `Badge.tsx` — 6 variants (default, success, warning, danger, info, purple)

### 4. Admin Feature Layer
#### Types (`admin.types.ts`)
- [x] `AdminRole` — SUPER_ADMIN | ADMIN | SUPPORT
- [x] `AlertSeverity` — CRITICAL | HIGH | MEDIUM | LOW
- [x] `AdminDashboardData` — KPIs, alerts, recent activity
- [x] `Alert` — severity, message, timestamp, link
- [x] `ActivityItem` — action, user, timestamp
- [x] `AdminUser` — profile, status (ACTIVE/FROZEN/SUSPENDED), KYC tier, volume
- [x] `PendingKycItem` — user info, documents, submitted date
- [x] `KycDocument` — type, status, URL
- [x] `ComplianceCaseItem` — type, status, severity
- [x] `FailedPayoutItem` — amount, reason, attempts
- [x] `FraudAnalysis` — riskScore (0-100), flags, activity log

#### Mock API (`admin.api.ts`)
- [x] `getDashboard()` — 8 KPIs, 5 alerts, 5 activity items
- [x] `getUsers()` — 25 mock users (3 frozen, 2 suspended)
- [x] `toggleUserStatus(userId)` — stub
- [x] `getPendingKyc()` — 10 applicants (Tier 2/3)
- [x] `approveKyc(kycId)` — stub
- [x] `rejectKyc(kycId)` — stub
- [x] `getComplianceCases()` — 12 cases (4 types, 4 statuses)
- [x] `escalateCase(caseId)` — stub
- [x] `getFailedPayouts()` — 8 failed payouts
- [x] `retryPayout(payoutId)` — stub
- [x] `analyzeFraud(userId)` — dynamic risk score + random flags

#### Store (`admin.store.ts`)
- [x] Zustand store with all state + actions
- [x] Actions: fetchDashboard, fetchUsers, toggleUserStatus, fetchPendingKyc, approveKyc, rejectKyc, fetchComplianceCases, escalateCase, fetchFailedPayouts, retryPayout, analyzeFraud
- [x] Optimistic UI updates on mutations (toggle, approve, reject, retry, escalate)

### 5. Routes & Guards
- [x] Route: `/login` — public login page
- [x] Route: `/` — protected dashboard (index)
- [x] Route: `/users` — user management
- [x] Route: `/kyc` — KYC review
- [x] Route: `/cases` — compliance cases
- [x] Route: `/payouts` — payout monitor
- [x] Route: `/fraud` — fraud investigation
- [x] Route: `*` — catch-all redirects to `/`
- [x] `ProtectedRoute` component — checks token, redirects to `/login`
- [x] Logout clears token + redirects

### 6. Pages
#### Login (`Login.tsx`)
- [x] Dark theme, centered form
- [x] Email + password inputs with validation
- [x] Demo credentials hint
- [x] Mock auth (admin@quicksend.com / admin123)
- [x] Stores token on success, navigates to `/`

#### Admin Layout (`AdminLayout.tsx`)
- [x] Collapsible sidebar (w-16 / w-60)
- [x] 6 nav items with active state (indigo highlight)
- [x] Sign Out button at bottom
- [x] Animated chevron toggle

#### Dashboard (`Dashboard.tsx`)
- [x] 8 KPI cards (Total Users, Active, Transfers, Volume, Pending KYC, Failed Payouts, Open Cases, Fraud Alerts)
- [x] Active Alerts panel (color-coded by severity)
- [x] Recent Activity feed (timeline dots)
- [x] Loading spinner on initial fetch
- [x] Responsive grid (2-col → 4-col)

#### Users (`Users.tsx`)
- [x] Search input (filters by name/email)
- [x] Table with 7 columns (Name, Email, Status, KYC Tier, Transfers, Volume, Actions)
- [x] Status badges (Active/Frozen/Suspended)
- [x] Freeze/Activate toggle with optimistic UI
- [x] Responsive scrollable table

#### KYC Review (`KycReview.tsx`)
- [x] Pending application cards
- [x] User info + Tier badge
- [x] Document list with status badges
- [x] Approve / Reject buttons with store integration
- [x] Empty state when no pending applications

#### Compliance Cases (`ComplianceCases.tsx`)
- [x] Case cards with severity + status badges
- [x] Escalate button for non-closed cases
- [x] Date display
- [x] Active case count in header
- [x] Empty state

#### Payout Monitor (`PayoutMonitor.tsx`)
- [x] Failed payout cards with amount, reason, attempt count
- [x] Status badges (Failed / Pending Retry)
- [x] Retry button with store integration
- [x] Empty state

#### Fraud Investigation (`FraudInvestigation.tsx`)
- [x] User ID search input (Enter key support)
- [x] Risk score display (0-100, color-coded: green/amber/red)
- [x] Risk level label (Low/Medium/High)
- [x] Risk flags as badges
- [x] Activity log timeline
- [x] Empty state with instructions
- [x] Loading state on analyze

### 7. Build & Quality
- [x] TypeScript compilation: 0 errors
- [x] Vite production build: 0 errors
- [x] Output: 386KB JS, 17KB CSS (gzip: 123KB + 4KB)

### 8. Deployment
- [ ] Add `railway.json` for Railway deployment
- [ ] Configure `VITE_API_URL` in Railway dashboard
- [ ] Create `favicon.svg`
- [ ] Add `.gitignore`
- [ ] Push to GitHub, connect to Railway

---

## Mock Credentials

| Role      | Email                    | Password  |
|-----------|--------------------------|-----------|
| Admin     | admin@quicksend.com      | admin123  |

---

## Future Enhancements
- [ ] Real API integration (flip `USE_ADMIN_MOCK = false`)
- [ ] WebSocket real-time alerts
- [ ] Pagination for users, KYC, cases tables
- [ ] Export to CSV
- [ ] Audit log viewer
- [ ] Role-based access control (SUPER_ADMIN vs ADMIN vs SUPPORT)
- [ ] Notification center
