# PDPL Checker - Project TODO

## Design & Theming
- [x] Choose design style (calm, trustworthy: deep blue + white + green/red status)
- [x] Configure Arabic (RTL) + English support, add fonts (IBM Plex Sans Arabic)
- [x] Update index.css with color palette and base tokens

## Backend - Scanning Engine
- [x] Build tracker domain database (Google, Meta, TikTok, etc. categorized)
- [x] Fetch target URL HTML + headers (server-side, with timeout & error handling)
- [x] Detect third-party tracker scripts/domains in HTML
- [x] Detect cookies set via HTTP headers
- [x] Detect privacy policy link presence
- [x] Detect cookie consent banner presence
- [x] AI-based PDPL compliance summary (Arabic, with fallback)
- [x] Compute overall privacy score (A-F grade)
- [x] tRPC procedure `scan.run` returning structured report
- [x] Persist scan results to database (scans table)

## Frontend - UI
- [x] Hero section with URL input + Scan button
- [x] Loading state with scanning animation + cycling text
- [x] Results dashboard: overall score card (gauge)
- [x] Key metrics grid (cookies, trackers, PDPL status)
- [x] PDPL compliance breakdown section (checks with explanations)
- [x] Trackers & cookies breakdown (categories + companies)
- [x] Export report (print to PDF)
- [x] Educational About page: what is PDPL, why it matters
- [x] Responsive + RTL layout
- [x] Site header with navigation

## Testing
- [x] Vitest tests for scanning logic (7 tests passing)
- [x] Vitest tests for tracker detection
- [x] Test full scan flow in browser (github.com=A, cnn.com=B)
- [x] TypeScript check passes

## Delivery
- [x] Check status, fix errors
- [x] Save checkpoint
- [x] Deliver to user

## Dark Mode (new request)
- [x] Enable switchable theme in App.tsx (ThemeProvider)
- [x] Add theme toggle button in SiteHeader
- [x] Verify dark theme tokens look good across all pages/components
- [x] Verify gauge/category bar colors remain readable in dark mode
- [x] Test toggle persistence and browser rendering
