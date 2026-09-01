# PG Management System — Tech Stack & Feature Priority Recommendations

*Based on: pg-management-core-features.md*

---

## Suggested Tech Stack

### Simplest path (fast MVP, small team)

- **Frontend:** React + Tailwind CSS (or Next.js if you want SSR/SEO for a landing page)
- **Backend:** Node.js + Express, or just Next.js API routes (one codebase, less overhead)
- **Database:** PostgreSQL — relational data (tenants, rooms, payments) fits relational structure much better than NoSQL
- **Auth:** Clerk or Supabase Auth (skip building auth yourself)
- **File storage:** Supabase Storage or AWS S3 (for ID proofs, agreements, complaint photos)
- **Hosting:** Vercel (frontend) + Supabase/Railway/Render (DB + backend)

### Why Supabase fits well here

It bundles Postgres + Auth + Storage + row-level security in one place, which covers:
- Feature #1 (Tenant Profiles)
- Feature #3 (Rent & Payment Tracking)
- Feature #7 (Document Storage with verification)

...with minimal setup. Great fit for a solo dev or small team shipping v1 fast.

### If mobile is on the roadmap

React Native or Flutter, sharing the same Postgres backend via REST/GraphQL API. (Tenant self-service is Phase 2, but worth planning the API layer for it now.)

---

## Feature Priority — Ranked by Real-World Impact vs. Effort

| Rank | Feature | Why |
|------|---------|-----|
| 1 | **Rent & Payment Tracking** | The actual pain point. Alone, this would get an owner to switch from notebooks/WhatsApp. |
| 2 | **Room & Bed Inventory** | Prevents double-booking — the second most costly manual error. |
| 3 | **Tenant / Resident Profiles** | Foundational; #1 and #2 depend on it. |
| 4 | **Basic Dashboard** | Cheap to build once #1–3 exist (just aggregation queries), high perceived value — owners love a single "am I okay?" screen. |
| 5 | **Complaint / Maintenance Requests** | Meaningfully reduces tenant churn, not hard to build. |

### Lower priority for true v1

- **Visitor Log** & **Document Storage** — valuable, but not daily-use-critical. Good fast-follow after launch.
- **Notice Board** & **Check-in/Check-out Workflow** — nice structure, but owners currently survive fine with WhatsApp/manual notes for these.

---

## Recommended MVP Scope

Build **#1, #2, #3, #9** (Rent Tracking, Room Inventory, Tenant Profiles, Basic Dashboard) first.

This is the smallest feature set that already beats "PG owner using a notebook + WhatsApp" — which is the real competition, not other software.

---

*Next step: database schema (tables + relations) to start coding against.*
