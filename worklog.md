---
Task ID: 1
Agent: main
Task: Убрать трейдеров из Overview, призраки-аватары, 2328.io подписки, мульти-рефералы

Work Log:
- Removed TradingOverview component from Overview tab in page.tsx
- Replaced trader emoji avatars with GhostIcon in TradersList.tsx
- Added "Most Bet On This Month" trending summary section to Traders
- Aligned "All Traders" heading to container (px-4)
- Updated Prisma schema: User (referralCode, referredByCode, balance), Payment, ReferralCommission models
- Pushed schema to Neon PostgreSQL
- Created /api/subscription/create — 2328.io invoice creation ($4/40 gens)
- Created /api/subscription/webhook — payment callback with multi-level commissions (30%/10%/5%)
- Updated /api/user — referral code generation, DB user stats
- Updated ProfileView — subscription card with Buy Premium, referral program card with code + copy + 3-tier commission display
- Fixed .env (restored Neon DB URL, added 2328.io credentials)
- Fixed TypeScript errors in webhook route and page.tsx TMA SDK types
- Verified via Browser + VLM: Overview (search + carousel, no traders), Traders (ghosts + trending), Profile (Not Authorized CTA for preview)

Stage Summary:
- Overview: search bar, event carousel, event cards — NO traders section
- Traders: "All Traders" heading, "Most Bet On This Month" horizontal pills, trader cards with GhostIcon circular avatars + rank badges
- Profile (authorized): user card + subscription card ($4/40 gens) + referral program card (8-char code, copy button, 3-tier commissions: 30%/10%/5%)
- Profile (unauthorized): Telegram CTA
- Backend: 2328.io invoice API, webhook with multi-level commission distribution, Prisma schema with Payment + ReferralCommission---
Task ID: 1
Agent: main
Task: Remove theme switching, keep only dark mode for TMA

Work Log:
- Killed all next processes, cleared .next, restarted server via nohup
- Fixed hydration mismatch (isDark defaulting to true before mount)
- Verified server stable with agent-browser
- Removed `useTheme`/`ThemeProvider`/`next-themes` from page.tsx and layout.tsx
- Removed Sun/Moon toggle button from search bar
- Removed `isDark` prop from 12 component files: page.tsx, layout.tsx, BottomNavigation, EventCard, EventCarousel, EventModal, TraderDetailModal, ProfileView, TradersList, SkeletonCard, ProfileMenu, LeaderboardSection, RefreshModal, GhostParticles
- Removed all `isDark ? dark : light` ternaries — kept only dark branches
- Removed unused `lightBgGradients`, `lightStyles` arrays
- Verified all 4 tabs (Overview, Traders, Feed, Profile) render correctly
- Confirmed no hydration errors in console

Stage Summary:
- App is now dark-mode only, no theme switching
- Zero `isDark` references in active source files (only unused ProfileHeader.tsx and TradingOverview.tsx remain)
- Server running on port 3000, HTTP 200, all tabs functional
