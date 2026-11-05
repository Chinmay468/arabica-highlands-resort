# Deployment & Local Setup Guide

**Project:** Arabica Highlands Resort & Sanctuary — Direct Booking & AI Enquiry Routing Engine  
**Client Problem Statement:** Option 1 (Chikkamagaluru Coffee-Estate Resort, 76 Keys)

---

## 1. Quick Reviewer Demo Credentials

For immediate evaluation, the application includes pre-seeded demo accounts with role-based access control (RBAC). You can switch between roles in **1 click** using the top utility bar or the `/login` portal:

| Role | Email | Permissions & Focus Areas |
|---|---|---|
| **General Manager (GM)** | `gm@arabicahighlands.com` | Full administrative control: Daily allotment & rate matrix, blackout/stop-sell toggles, promo code engine, low-confidence triage queue, emergency complaint alerts. |
| **Reservations & Sales Staff** | `reservations@arabicahighlands.com` | Operational inbox: AI enquiry queue, rate-table grounded reply approvals, 1-click owner re-routing, confirmed booking PMS exports. |
| **Guest (Consumer)** | `guest@example.com` | Consumer direct booking: Room catalog, live date-range pricing, 3-step test-mode checkout, itemized per-night GST tax receipts, Form C foreign guest notice. |

---

## 2. Step-by-Step Local Setup

### Prerequisites
- **Node.js:** v18.18+ or v20+ or v24+
- **Package Manager:** npm v9+

### Installation & Initialization
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Chinmay468/arabica-highlands-resort.git
   cd arabica-highlands-resort
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
   *Note: On Windows PowerShell:*
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Initialize Database & Seed Realistic Sample Data:**
   Synchronize SQLite schema in WAL mode and seed the 76 keys, 90-day allotment calendar, and sample enquiries (`ENQ-4410`, `ENQ-4411`, `ENQ-4412`, plus complaint and low-confidence edge cases):
   ```bash
   npx prisma db push
   npm run db:seed
   ```

5. **Run the Automated Concurrency & AI Test Suites:**
   Verify atomic allotment locking (20 parallel requests for 1 remaining unit) and rate-table grounded AI routing:
   ```bash
   # Run full Vitest suite (allotment concurrency + AI router + GST slabs)
   npm test

   # Or run standalone 20-request concurrency stress test
   npm run test:concurrency
   ```

6. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Production Build & Execution

To test the optimized production build locally:
```bash
npm run build
npm start
```
The server will bind to port `3000`.

---

## 4. Production Deployment

### Option A: Vercel (Recommended)
1. Push the code to a public GitHub repository.
2. Import the project into the [Vercel Dashboard](https://vercel.com).
3. The build command will automatically detect Next.js (`npm run build`).
4. Set the environment variables in the Vercel Settings (see list below).
5. Deploy.

### Option B: Railway / Render / Docker (Self-Hosted Node.js)
1. Deploy from the Git repository.
2. Build Command: `npm install && npx prisma generate && npx prisma db push && npm run db:seed && npm run build`
3. Start Command: `npm start`

---

## 5. Required Environment Variables (Names Only)

Per security guidelines, only variable names are listed here. No secret values are stored in the repository:

| Variable Name | Purpose | Required / Optional |
|---|---|---|
| `DATABASE_URL` | SQLite / PostgreSQL connection string (configured with WAL mode and `busy_timeout=5000`) | **Required** |
| `NODE_ENV` | Environment identifier (`development` or `production`) | **Required** |
| `NEXT_PUBLIC_APP_URL` | Canonical public URL of the web application | **Required** |
| `GEMINI_API_KEY` | Optional API key for Google Gemini LLM API (if unset, deterministic local AI router runs offline with 100% fidelity) | *Optional* |
