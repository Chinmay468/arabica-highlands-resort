# Arabica Highlands Resort & Sanctuary
### Direct Booking Engine, Atomic Allotment Locking & Omnichannel AI Enquiry Router

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.5-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL_Mode-003B57?style=flat&logo=sqlite)](https://www.sqlite.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?style=flat&logo=vitest)](https://vitest.dev/)
[![Compliance](https://img.shields.io/badge/Compliance-DPDP_Act_2023_%26_Form_C-success)](https://www.meity.gov.in/)

> A full-stack direct booking engine and automated AI lead-routing platform designed for **Arabica Highlands Resort & Sanctuary**—a 76-key boutique coffee estate in Chikkamagaluru, Karnataka. Built for **Option 1: Hill resort direct-booking website with AI enquiry routing**.

---

## 💼 The Business Math: Unlocking ₹1.05 Cr/Year Bottom-Line

Arabica Highlands operates 76 keys (20 Heritage Rooms, 44 Plantation Cottages, 12 Pool Villas) at 62% average occupancy and ₹9,500 ADR:

1. **Direct Booking Commission Recovery ($\sim$₹33.3 Lakhs / Year)**:
   - Total Room Revenue: $76 \times 365 \times 0.62 \times ₹9,500 \approx ₹16.34\text{ Cr/year}$.
   - Current OTA Share: 68% paying 20% commission ($\approx ₹2.22\text{ Cr/year}$ lost in agency fees).
   - Shifting just 15% of total bookings to direct saves **₹33.3 Lakhs annually** in direct commissions.

2. **Banquet & Wedding Latency Elimination ($\sim$₹72 Lakhs / Year)**:
   - The resort receives $\approx 90$ event/wedding enquiries monthly.
   - Due to manual coordination across departments, 30% wait $> 24$ hours for quotations, resulting in an estimated 3 lost high-value bookings/month.
   - At a conservative net contribution of ₹2.0 Lakhs per wedding/retreat, recovering these 3 deals unlocks **₹72.0 Lakhs annually**.

3. **Total Addressable Unlock**: **$\approx ₹1.05\text{ Crore}$ directly added to EBITDA annually.**

---

## 🚀 Reviewer 1-Minute Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Chinmay468/arabica-highlands-resort.git
cd arabica-highlands-resort

# 2. Install dependencies
npm install

# 3. Seed database (creates 76 keys, 90-day allotments, demo users, & test enquiries)
npm run prisma:seed

# 4. Start development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Pre-Seeded Reviewer Demo Credentials

Use the **1-Click Role Switcher** in the top navigation bar to toggle between roles instantly:

| Role | Email Address | Access Level & Capabilities |
| :--- | :--- | :--- |
| **General Manager (GM)** | `gm@arabicahighlands.com` | Unsorted / Low-Confidence Triage Lane (`<80%`), High-Priority Guest Complaints, Allotment & Rate Overrides |
| **Reservations Staff** | `reservations@arabicahighlands.com` | AI Unified Inbox, 1-Click Re-routing, Human-in-the-Loop Draft Approval, PMS Exporter |
| **Guest** | `guest@example.com` | Quiet Luxury Guest UI, 3-Step Checkout, Real-Time GST Slabs, Printable Receipt Folio |

---

## 🧪 Automated Test Verification

### 1. Concurrency Stress Test (20 Parallel Threads vs 1 Room)
Verifies that naive ORM check-then-act bugs are eliminated via atomic conditional decrement locks:

```bash
npm run test:concurrency
```
**Expected Output**: Fired 20 concurrent booking requests simultaneously via `Promise.allSettled()` in 54ms:
- `Fulfilled / Confirmed Bookings: 1`
- `Rejected Bookings (Safeguarded): 19`
- `Zero double bookings. Final database allotment: 1/1.`

### 2. Full Vitest Test Suite (Unit & AI Router Tests)
```bash
npm test
```
**Expected Output**: 7 passed tests covering all 5 omnichannel enquiry categories, rate-grounding, complaint auto-escalation, and edge cases.

---

## 🏛️ High-Level System Architecture

```text
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           CLIENT VIEWPORT                              │
  │   [Guest Experience]     [Staff AI Inbox]       [GM Reviewer Portal]   │
  └──────────────────┬─────────────────┬───────────────────┬───────────────┘
                     │                 │                   │
                     ▼                 ▼                   ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                     NEXT.JS 15 (APP ROUTER)                            │
  │   Server Components (RSC)  •  Route Handlers  •  Server Actions        │
  ├────────────────────────────────────────────────────────────────────────┤
  │   • app/actions/booking.ts (Atomic Allotment Engine, Per-Night GST)    │
  │   • app/actions/enquiry.ts (Omnichannel Intake & Re-routing)           │
  │   • lib/ai-router.ts (Intent Classification, Rate-Table Grounding)     │
  │   • lib/auth.ts (Lightweight Session Cookie Auth)                      │
  └──────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                        PRISMA ORM & STORAGE                            │
  │   SQLite (WAL Mode, busy_timeout=5000, connection_limit=1)             │
  │   [RoomType] ──< [DailyAllotment] ──< [Booking] ──< [BookingNight]     │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Key Architectural & Regulatory Implementations

### 1. Atomic Allotment Engine (Eliminating TOCTOU Race Conditions)
- **The Problem**: High-concurrency booking engines fail when using naive ORM `findUnique()` checks followed by `update()`. Two parallel requests read `allotment = 1`, and both proceed to write, causing an agency overbooking disaster.
- **The Solution**: An atomic conditional decrement query executes in a single database round-trip:
  ```sql
  UPDATE "DailyAllotment"
  SET "bookedCount" = "bookedCount" + 1
  WHERE "roomTypeId" = $1 AND "date" = $2 AND ("bookedCount" + 1) <= "totalAllotment";
  ```
  If zero rows are affected, the transaction aborts and safely returns `INSUFFICIENT_ALLOTMENT` without database deadlocks.

### 2. Indian Per-Night GST Slab Engine
Per Indian hotel taxation regulations, GST is computed **per room-night**, not by averaging the total stay:
- **Base Tariff $\le ₹7,500$ / night**: **12% GST** (6% CGST + 6% SGST)
- **Base Tariff $> ₹7,500$ / night**: **18% GST** (9% CGST + 9% SGST)
- The checkout modal displays dynamic per-night slab breakdowns with promo code deductions reflected before the tax computation.

### 3. AI Safety Guardrails & Human-in-the-Loop
- **No Hallucinated Rates**: Draft responses are strictly grounded against the real-time database rate table. The AI never invents tariffs.
- **Confidence Triage Lane**: Queries with confidence $< 80\%$ or ambiguous requests automatically route to the **GM Unsorted Lane**.
- **Instant Complaint Escalation**: Urgent facility/service complaints immediately alert the GM with an `ESCALATED_GM` badge.
- **Human Approval**: Drafts are **never sent automatically**; staff must review, edit, and click "Approve & Dispatch".

### 4. DPDP Act 2023 & Form C Compliance
- **Digital Personal Data Protection (DPDP) Act 2023**: Mandatory explicit consent checkbox captured prior to payment authorization.
- **Statutory Form C (Foreign Guests)**: Captures a digital declaration while deferring physical passport/visa verification to on-site check-in per Ministry of Home Affairs rules.

---

## 📦 Project Deliverables

| File | Purpose |
| :--- | :--- |
| [`Technical_Design_Document.docx`](./Technical_Design_Document.docx) | Formal Technical Design Document (System Architecture, Concurrency Locks, Data Model, Scalability). |
| [`TDD.md`](./TDD.md) | Markdown version of the Technical Design Document. |
| [`deployment.md`](./deployment.md) | Comprehensive production deployment, local setup, and rollback instructions. |
| [`submission.zip`](./submission.zip) | Packaged bundle of the TDD docx, deployment guide, and markdown artifacts. |

---

## 👨‍💻 Author
**Chinmay Maheshwari**  
GitHub: [@Chinmay468](https://github.com/Chinmay468)  
Email: [chinmay8064@gmail.com](mailto:chinmay8064@gmail.com)
