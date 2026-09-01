# Design.md — PG Management System

> **Purpose:** This file is the single source of truth for visual design decisions in this codebase. Any AI agent (or human) building UI here should read this before writing markup, and should reference **token names**, never raw hex values, in code. If a needed token doesn't exist yet, extend this document first, then use it — don't invent one-off colors, sizes, or fonts inline.

**Version:** 1.1 · **Stack assumption:** Tailwind CSS · **Status:** Living document — sections marked *"proposed"* were not specified by the design team and should be confirmed, but are safe production defaults in the meantime.

> **v1.1 changes:** Reviewed against the PRD (`PRD` — User Flows & Page Flows). Updated: light-mode background/text to pure white/black per direct request; domain status colors now match the PRD's explicit legends (payment, room, document verification); added a tenant lifecycle status set; added components the PRD's pages actually need (stat cards, alerts, filter bars, modals, printable receipt, auth screen); added a page-to-component quick reference. Removed statuses that weren't in the PRD (partial payment, room "reserved," complaint priority) rather than speculate — add them back here when those v2 features are actually specified. **The PRD itself was not modified.**

---

## 1. Design Principles

1. **Minimal by default, orange with intent.** The interface is mostly black, white, and gray. Web-orange is a signal, not a background — use it for primary actions, active states, and key status indicators, not for decoration.
2. **Two-tone signature.** Orange + near-black is the identity of this product (see §2.5). Lean on that pairing for anything that should feel "brand," and leave everything else neutral.
3. **Flat over floating.** Prefer a 1px border to a shadow. Reserve shadows for things that are genuinely floating above content (modals, dropdowns, toasts).
4. **Numbers matter.** This is a rent/property management tool — tables full of amounts, dates, and unit numbers are the core UI (see the PRD's Room List, Payment Tracking, and History pages). Alignment, tabular figures, and status legibility take priority over visual flourish.
5. **Say it with color *and* an icon/label.** Never make color the only carrier of meaning (rent status, room status, etc. always pair a color with text or an icon) — this matters here because the PRD itself expresses statuses as icon + label (✅ PAID, 🔴 OVER), not color alone.

---

## 2. Color System

### 2.1 Primitive Scales (as provided)

```js
// tailwind.config.js — theme.extend.colors
colors: {
  'web-orange': {
    50:  '#fffbea', 100: '#fff4c5', 200: '#ffe985', 300: '#ffd746',
    400: '#ffc41b', 500: '#ffa500', 600: '#e27d00', 700: '#bb5602',
    800: '#984108', 900: '#7c360b', 950: '#481a00',
  },
  'black': {
    50: '#fafafa', 100: '#f5f5f5', 200: '#e6e6e6', 300: '#d6d6d6',
    400: '#a5a5a5', 500: '#767676', 600: '#575757', 700: '#434343',
    800: '#292929', 900: '#1a1a1a', 950: '#000000',
  },
  white: '#ffffff',
}
```

`web-orange` = **primary**. `black` = **neutral**. Nothing else should be hardcoded as a raw hex in components.

### 2.2 Semantic Colors *(proposed — not specified, derived to pair cleanly with the scales above)*

Four status hues, kept deliberately outside the orange family so they never get confused with primary/brand actions:

| Role | 50 (bg tint) | 100 (border tint) | 500 (base) | 600 (hover/strong) | 700 (text-on-light) |
|---|---|---|---|---|---|
| **Success** | `#f0fdf4` | `#dcfce7` | `#22c55e` | `#16a34a` | `#15803d` |
| **Warning** | `#fffbeb` | `#fef3c7` | `#f59e0b` | `#d97706` | `#b45309` |
| **Error / Destructive** | `#fef2f2` | `#fee2e2` | `#ef4444` | `#dc2626` | `#b91c1c` |
| **Info** | `#eff6ff` | `#dbeafe` | `#3b82f6` | `#2563eb` | `#1d4ed8` |

> `web-orange` stays the *brand* color; `warning` (amber) is the separate *generic UI* warning color. Orange is reused for exactly one domain concept, deliberately: see "Pending" in §2.4.

### 2.3 Semantic Tokens (Light / Dark)

**Light mode is pure white/black per direct request** — canvas and surface are the same white; zones are separated with borders and dividers, not background tint (this actually reinforces principle #3 — flat, bordered, minimal).

| Token | Light mode | Dark mode |
|---|---|---|
| `bg-canvas` (page background) | `white` | `black-900` |
| `bg-surface` (cards, sheets) | `white` | `black-800` |
| `bg-surface-raised` (modals, dropdowns, popovers) | `white` *(differentiated by shadow, not color — §7)* | `black-700` |
| `border-default` | `black-200` | `black-700` |
| `border-subtle` / dividers | `black-100` | `black-800` |
| `text-primary` | `black-900` | `black-50` |
| `text-secondary` | `black-600` | `black-400` |
| `text-disabled` | `black-400` | `black-600` |
| `text-on-primary` | `black-900` *(see §2.5)* | `black-900` |
| `primary` (default) | `web-orange-600` | `web-orange-500` |
| `primary-hover` | `web-orange-700` | `web-orange-400` |
| `focus-ring` | `web-orange-300` | `web-orange-400` |

> `text-primary` defaults to `black-900` (#1a1a1a), not literal `#000000`. At UI text sizes it's visually indistinguishable from true black (~17:1 contrast on white) and is easier on the eyes than pure black — this is the standard reason near-black is used over `#000000` in most interfaces. If you specifically want literal pure black everywhere, swap `text-primary` to `black-950`. The one place this doc *does* use literal `black-950`/pure black unconditionally is the Receipt component below, since that's a printed document, not a screen — see §9 "Printable Document (Receipt)."

### 2.4 Domain Status Colors

Derived directly from the PRD's own legends and state diagrams — use these mappings consistently; don't let individual screens invent their own.

**Rent / Payment status** *(from PRD: Payment Tracking page + "Payment Lifecycle" state diagram)*
| Status | Token | Notes |
|---|---|---|
| Paid | `success` | PRD: ✅ PAID |
| Pending (before due date) | `web-orange` | PRD: ⏳ PEND. Intentional brand reuse — "pay attention to this" |
| Overdue (past due date) | `error` | PRD: 🔴 OVER |
| Disputed *(v2)* | `warning` | PRD flags this as v2 / requires admin review; not detailed further, kept minimal until specified |

**Room / Bed status** *(from PRD: Room List legend — 🟢 VACANT 🔴 OCCUPIED 🟡 MAINTENANCE)*
| Status | Token |
|---|---|
| Vacant | `success` |
| Occupied | `error` |
| Under maintenance | `warning` |

> ⚠️ **Worth double-checking with your team:** mapping "Occupied" to `error` (red) matches the PRD's legend exactly, but it's an unusual choice — occupied is normally the *good*, revenue-generating state, and on a mostly-full property this will paint the room list mostly red. If that turns out to be a copy/wireframe shorthand rather than an intentional signal, the more conventional alternative is `neutral` (black-100 bg / black-700 text) for Occupied, reserving red purely for problems. I've implemented it as specified in the PRD; flag it if you want the neutral version instead.

**Tenant lifecycle status** *(from PRD: "Tenant Lifecycle" state diagram — ACTIVE → NOTICE_PERIOD → VACATED. Colors not specified in the PRD; proposed here.)*
| Status | Token |
|---|---|
| Active | `neutral` (black-100 bg / black-700 text) — the default, normal state; doesn't need to compete visually with actual alerts |
| Notice period | `warning` — moving out soon, heads-up for the admin |
| Vacated | muted neutral (black-200 bg / black-500 text) — historical record, de-emphasized |

**Document verification status** *(from PRD: "Document Upload & Verification" state diagram)*
| Status | Token |
|---|---|
| Upload required | `warning` — blocks tenant finalization, needs action |
| Pending verification | `info` — uploaded, awaiting admin review |
| Verified | `success` |
| Rejected | `error` — re-upload required |

*(Complaint/ticket priorities aren't in the PRD yet — "Submit complaints" is listed as v2 with no structure given. Add a status table here once that flow is actually specified rather than guessing at priority levels now.)*

### 2.5 Brand Signature: Text-on-Primary

`web-orange-500` and `600` **fail contrast with white text** (~2:1, well under the 4.5:1 AA minimum for text). This isn't a flaw — it means the correct default is:

> **Black text/icons on orange backgrounds** (`black-900` on `web-orange-500/600` → ~8.8:1 and ~5.9:1 contrast, both comfortably pass AA).

Use white text on orange **only** at `web-orange-700` or darker (~4.7:1, passes AA normal text). This orange+black pairing is a good thing to embrace deliberately — it's bold, high-contrast, and reads as the product's signature combination (primary buttons, active nav items, key stat highlights).

### 2.6 Contrast Rules of Thumb

- Never use `web-orange-500` for body text on a light background — it fails AA (~2:1). For orange **text**, use `700` or darker on light surfaces, or `300`–`400` on dark surfaces.
- `black-400` text is fine for secondary text but **fails AA for body copy** — restrict it to disabled states, placeholders, or large decorative text only.
- All status badge text pairings above (`x-100` bg + `x-700` text) are AA-safe; don't swap the pairing.

---

## 3. Typography *(proposed — not specified)*

**Family:** [Inter](https://fonts.google.com/specimen/Inter) (Google Font) — clean, highly legible at small sizes, excellent tabular figures for the PRD's rent/financial tables (Payment Tracking, History & Reports).

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

If you'd rather stay fully inside the Google ecosystem to match the iconography, **Roboto** is the alternative — same rules below apply either way.

### Type Scale

| Token | Size / Line-height | Weight | Usage |
|---|---|---|---|
| `display` | 36px / 44px | 700 | Empty states, marketing/hero moments |
| `h1` | 30px / 38px | 700 | Page titles |
| `h2` | 24px / 32px | 600 | Section headers |
| `h3` | 20px / 28px | 600 | Card / subsection headers |
| `h4` | 16px / 24px | 600 | Small headers, emphasized labels |
| `body-lg` | 16px / 24px | 400 | Primary reading content |
| `body` | 14px / 20px | 400 | Default UI text, table cells, form inputs |
| `body-sm` | 13px / 18px | 400 | Secondary text, helper/hint text |
| `caption` | 12px / 16px | 500 | Badge labels, timestamps, metadata |
| `overline` | 11px / 16px | 600, uppercase, +0.06em tracking | Section eyebrows |

**Rules**
- Don't skip heading levels for style reasons; use `h4`/`caption` weight+size tricks instead of jumping to `h1` for emphasis.
- Financial/numeric columns (rent amounts, dates, room numbers) use `font-variant-numeric: tabular-nums` so digits align in tables.
- Minimum body text size is 13px — nothing smaller, for readability.

---

## 4. Iconography

**Icon set:** [Google Material Symbols](https://fonts.google.com/icons) (variable font, not the legacy Material Icons set).

**Style:** **Rounded**, weight 400, optical size 24, grade 0 — as the default outlined-rounded style. It's the softer, more approachable cut, which suits a product tenants (often students/young professionals) use daily, and its rounded terminals pair naturally with Inter's humanist letterforms.

- Use **filled** rounded icons only for active/selected states (e.g., current nav item) — never mix filled and outlined icons within the same context otherwise.
- Never mix in a different icon set (no Font Awesome, no Heroicons, no custom SVG icon packs) — Material Symbols only, to keep the vocabulary consistent.
- The PRD's page mockups use emoji as placeholders (📊 🔴 🟢 🚀 💰) — treat these as **stand-ins for the real icon**, not literal emoji in the shipped UI. Map: 📊→`bar_chart`/`insights`, 🔴/🟢/🟡→status dot (not an icon, see badges below), 🚀→`bolt`/`rocket_launch`, 💰→`payments`, 📅→`calendar_month`, 📋→`list_alt`.

### Sizing

| Size | Usage |
|---|---|
| 16px | Inline with `body-sm`/`caption` text, inside dense table rows |
| 20px | Default in buttons, form fields, list items |
| 24px | Standalone nav/toolbar/action icons (default size) |
| 32px | Stat cards, feature highlights |
| 40–48px | Empty-state hero icons only |

### Color

Icons inherit `text-secondary` by default; use `primary` or a status color (§2.4) only when the icon itself is carrying that meaning (e.g., a green checkmark for "Verified"). Decorative icons get `aria-hidden="true"`; meaningful ones get an accessible label.

---

## 5. Spacing & Layout

Base unit: **4px**, following Tailwind's default spacing scale — don't introduce arbitrary pixel values in components.

| Context | Value |
|---|---|
| Button padding (md) | `px-4 py-2` |
| Input padding | `px-3 py-2` |
| Card padding | `p-6` |
| Page gutters | `px-4` mobile / `px-8` desktop |
| Gap between form fields | `space-y-4` |
| Gap between cards in a grid | `gap-4` (mobile) / `gap-6` (desktop) |

---

## 6. Radius

| Token | Value | Usage |
|---|---|---|
| `sm` | 6px | Inputs, chips/badges |
| `md` | 8px | Buttons, small cards |
| `lg` | 12px | Cards, modals |
| `xl` | 16px | Large sheets/drawers |
| `full` | 9999px | Avatars, pill badges |

---

## 7. Elevation

Minimal by design — most surfaces use a **border, not a shadow**. This matters more now that canvas and surface are both pure white (§2.3): shadow is how a *raised* surface (modal, dropdown) reads as raised, since it can no longer rely on a background-color difference.

| Level | Value | Usage |
|---|---|---|
| `flat` (default) | `border border-{border-default}`, no shadow | Cards, panels, sidebars |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Dropdowns, popovers |
| `shadow-md` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, dialogs, command palette |

Don't add shadow to static/inline content (cards, table rows) — it reads as noise against the minimal aesthetic.

---

## 8. Motion

Keep it subtle and fast — this is a utility product, not a marketing site.

- Hover / focus transitions: **150–200ms, ease-out**
- Modal / drawer enter-exit: **200–250ms, ease-out**
- No bounce/elastic/spring easing
- Respect `prefers-reduced-motion` — disable non-essential transitions when set

---

## 9. Component Conventions

### Buttons
- **Primary** — `web-orange-600` bg, `black-900` text/icon, hover `web-orange-700`.
- **Secondary** — `black-100` bg, `black-800` text.
- **Outline** — transparent bg, `border-default`, `black-800` text.
- **Ghost** — transparent, `black-700` text, `black-100` bg on hover.
- **Destructive** — `error-600` bg, white text. Used for PRD's "Delete Account," "Delete Tenant," "Delete" document actions.
- Sizes: `sm` 32px height, `md` 40px height (default), `lg` 48px height.
- Focus state: 2px `focus-ring` ring with 2px offset, on every interactive element, no exceptions.
- Disabled: `black-200` bg, `black-400` text, `cursor: not-allowed`.

### Forms
- Label: `caption`, `text-secondary`, above the field.
- Input: `border-default`, `radius-sm`, focus → `border-primary` + focus ring.
- Placeholder: `black-400`.
- Error state: `error-500` border, `error-700` helper text below, paired with an error icon (never color alone). Applies to PRD validations: phone (10 digits), email format, required ID proof, room double-booking, past move-in dates.
- Helper text: `body-sm`, `text-secondary`.

### Status Badges / Chips
- Pill shape (`radius-full`), `caption` text, `{status}-100` bg + `{status}-700` text, optional leading dot in `{status}-500`.
- Always map through §2.4 — don't pick ad hoc colors per screen. Used for: payment status, room status, tenant status, document status.

### Cards (Room card, Tenant card)
- `bg-surface`, `border-default`, `radius-lg`, `p-6`, **no shadow**.
- Status badge top-right, primary identifier (room #, tenant name) as `h3`, secondary metadata as `body-sm`/`text-secondary`.
- Actions live behind a kebab menu or appear on hover — don't clutter the default state.

### Stat / Metric Card *(new — PRD Dashboard: Occupancy Rate, Pending Payments)*
- `bg-surface`, `border-default`, `radius-lg`, `p-6`.
- Layout: `caption` label → large numeric value (`h1` or `display`, tabular-nums) → optional secondary line (`body-sm`) → text link/button at the bottom (e.g. "View Rooms").
- The number is the hierarchy anchor — don't add icons or color to the number itself unless the metric is itself a status (e.g., an overdue-amount stat can render the figure in `error-700`).

### Alert / Banner *(new — PRD Dashboard: 🔴 Overdue Alerts)*
- Left accent bar (4px, `{status}-500`) + `{status}-50` bg tint + icon + message + optional inline CTA link.
- Use for page-level or section-level warnings (e.g., "2 payments overdue by 5+ days"), not for per-row status (that's a badge, see above).

### Search + Filter Bar *(new — appears on Room List, Tenant Profiles, Payment Tracking, History & Reports)*
- Right-aligned in the page header row, next to the page title: search input (with a leading `search` icon, 20px) + one or more filter dropdowns.
- Filters render as simple `Label: [Value ▾]` selects at `body-sm`; keep them inline on desktop, stack under the search field on mobile.

### Tables
- Header row: `black-50` bg, `caption` text in `text-secondary`, uppercase.
- Row divider: `border-subtle`, no zebra striping (keep it flat/minimal).
- Row hover: `black-50` bg.
- Numeric columns (rent, dates): right-aligned, tabular-nums.
- Sticky header for long tenant/payment lists.
- **Expandable rows** (PRD Room List: a room row expands to show its individual beds) — indent nested rows, use `black-50` bg for the nested block, and a chevron icon (`expand_more` / rotates on open) at the row start. Bed-level rows carry their own room-status badge.

### Modals (Form) *(new — PRD: "Assign Tenant," "Mark Payment Received," "Change Password")*
- `bg-surface-raised`, `radius-lg`, `shadow-md`, max-width ~480px, centered, `p-6`.
- Header: `h3` title + close icon button (top-right).
- Footer: right-aligned button row — `Ghost`/`Outline` "Cancel" then `Primary` action, in that order (cancel first, reading left to right).
- Backdrop: `black-900` at low opacity (e.g. 40%), click-outside closes unless the action is destructive or has unsaved required fields.

### Auth Screen *(new — PRD: Login/Signup)*
- Centered card, max-width 400px, vertically centered on the viewport, `bg-canvas` behind it (plain white, no illustration/split-screen needed to stay minimal).
- No sidebar/nav chrome on this screen — it's the one page outside the app shell.

### Printable Document (Receipt) *(new — PRD: Generate Receipt)*
- **Always** `white` background and **literal pure-black** (`black-950`, `#000000`) text — regardless of the app's light/dark mode setting. This is a printed/PDF artifact, not a themed screen, so it follows print conventions (true black ink on white), not the app's UI token set.
- Structure: thin rule lines (`border-subtle`) instead of shadows or card backgrounds — it should look like a document, not a UI panel.
- No status badges or brand orange inside the receipt itself — it's a formal record; keep it monochrome except for a small business-name/logo treatment if one exists.
- Wrap it in `@media print` rules that strip any surrounding app chrome (nav, sidebar, buttons) when the browser print dialog is used.

### Toasts / Notifications
- `bg-surface`, 3–4px left accent bar in the relevant status color, matching icon.
- Success/info/warning auto-dismiss in 4–6s; errors persist until dismissed.

### Empty States
- Centered icon (32–48px, `black-300` or a light `primary` tint), `h3` heading, `body-sm`/`text-secondary` supporting copy, optional primary CTA.

### Avatars
- `radius-full`; fallback = initials on `black-100` bg, `black-700` text.
- Sizes: 24 / 32 / 40 / 48px.

---

## 10. Page → Component Quick Reference

Cross-referencing the PRD's own page list so it's obvious which section of this doc to reach for on each screen.

| PRD Page | Route | Key components |
|---|---|---|
| Login / Signup | `/auth` | Auth screen, form, primary button |
| Dashboard | `/dashboard` | Stat/metric cards, alert/banner, quick-action buttons, sidebar nav |
| Room List | `/rooms` | Search+filter bar, table with expandable rows, room status badge, assign-tenant modal |
| Tenant Profiles | `/tenants` | Search+filter bar, table, tenant status badge, add-tenant modal, document list |
| Payment Tracking | `/payments` | Filter bar, table, payment status badge, mark-payment modal |
| Generate Receipt | `/receipts` | Printable document |
| History & Reports | `/history` | Table, filter bar, summary stat cards, export button |
| Settings | `/settings` | Form, destructive button (delete account) |

---

## 11. Accessibility Checklist

- [ ] Minimum touch target: 40px (mobile especially — tenants will use this on phones).
- [ ] Every interactive element has a visible focus state (§9 Buttons).
- [ ] Status is never color-only — always paired with text or an icon (matches how the PRD itself writes statuses: icon + label, e.g. "🔴 OVER").
- [ ] Body text ≥ 13px; never rely on `black-400`/`web-orange-500` for text (§2.6).
- [ ] Form errors are announced (`aria-live="polite"` on the error region).
- [ ] Decorative icons: `aria-hidden="true"`. Meaningful icons: accessible label.

---

## 12. Implementation Reference

```css
/* globals.css — semantic tokens as CSS variables */
:root {
  --bg-canvas: theme(colors.white);
  --bg-surface: theme(colors.white);
  --bg-surface-raised: theme(colors.white);
  --border-default: theme(colors.black.200);
  --border-subtle: theme(colors.black.100);
  --text-primary: theme(colors.black.900);
  --text-disabled: theme(colors.black.400);
  --text-secondary: theme(colors.black.600);
  --text-on-primary: theme(colors.black.900);
  --color-primary: theme(colors.web-orange.600);
  --color-primary-hover: theme(colors.web-orange.700);
  --focus-ring: theme(colors.web-orange.300);
}

.dark {
  --bg-canvas: theme(colors.black.900);
  --bg-surface: theme(colors.black.800);
  --bg-surface-raised: theme(colors.black.700);
  --border-default: theme(colors.black.700);
  --border-subtle: theme(colors.black.800);
  --text-primary: theme(colors.black.50);
  --text-secondary: theme(colors.black.400);
  --text-disabled: theme(colors.black.600);
  --text-on-primary: theme(colors.black.900);
  --color-primary: theme(colors.web-orange.500);
  --color-primary-hover: theme(colors.web-orange.400);
  --focus-ring: theme(colors.web-orange.400);
}

/* Receipt is intentionally outside the token system — always literal, always print-safe */
.receipt {
  background: #ffffff;
  color: #000000; /* theme(colors.black.950) — pure black, not --text-primary */
}
```

---

## 13. Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Reference semantic tokens (`bg-surface`, `text-secondary`) in components | Hardcode `#ffa500` or any raw hex directly in JSX/CSS |
| Use black text on orange backgrounds | Use white text on `web-orange-500/600` (fails contrast) |
| Use the status-mapping tables in §2.4 for badges | Invent a new color per screen for "paid" / "vacant" etc. |
| Force the Receipt to pure black-on-white, ignoring dark mode | Let the receipt inherit dark-mode tokens — it must print correctly |
| Use borders/dividers to separate zones now that canvas = surface = white | Add a shadow to a card just for visual interest |
| Use Material Symbols Rounded exclusively | Mix in another icon library, or ship literal emoji from the PRD mockups |
| Extend this doc when a new token or status is needed | Silently deviate and hope no one notices |

---

*Anything marked "proposed" in this document (semantic colors, typography, icon style, tenant-status colors) reflects sensible defaults chosen to fit the given primitive scales, theme, and PRD — flag these to your design team for confirmation, but they're safe to build against in the meantime.*
