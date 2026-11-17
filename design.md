# Design System & UI/UX Specification: MedBay (`DESIGN.md`)

| Field | Detail |
| :--- | :--- |
| **Product Name** | MedBay (`medbay`) |
| **Visual Direction** | Private Health Atelier (*"Archival Emerald Vault"*) |
| **Theme Polarity** | Light Mode Primary (`#F5F5F0` Canvas) + Isolated Dark Document Viewer (`#0E1513`) |
| **Typography** | `Outfit` (Headings) · `Source Sans 3` (Body) · `JetBrains Mono` (Clinical Values & Citations) |
| **Target Viewport** | Mobile-First PWA (`360px–430px` primary) scaling to Tablet (`768px`) and Desktop (`1280px+`) |
| **Source of Truth** | Aligned 1:1 with `PRD.md` v1.0 |

---

## 1. Visual Direction & Design Principles

### 1.1 Core Aesthetic Philosophy & Brand Personality
**MedBay** embodies the aesthetic of a **Private Health Atelier**—tactile, grounded, calm, and authoritative, like a personal digital safety deposit box for a family's most sensitive medical records. Rather than sterile hospital white or flashy consumer tech neon, MedBay pairs a warm archival stone canvas (`#F5F5F0`) and crisp white record sheets (`#FFFFFF`) with deep botanical emerald (`#1B5E4B`) to communicate security, clarity, and human care. Inside raw document viewers (`/vault/[documentId]` file pane and `/share/[token]`), an isolated deep obsidian canvas (`#0E1513`) frames white-background lab PDFs and scanned prescriptions with maximum contrast and zero visual glare.

### 1.2 Strict UX Principles
1. **Emergency-First Thumb Ergonomics:** Primary actions (Upload `+`, Family Profile Switcher, One-Click Share) must be reachable within one thumb tap on mobile viewports (`44px x 44px` minimum target size) with zero nested hamburger menus blocking critical records.
2. **Zero Cross-Profile Ambiguity:** Every document card, chat session, and timeline row must visibly anchor its owning family member via a color-coded **Family Profile Pill** so caregivers never confuse a child's dosage or lab result with their own.
3. **Scannable Clinical Hierarchy:** AI summaries are never rendered as dense walls of text. They are strictly segmented into three scannable blocks (**Overview**, **Key Findings & Critical Flags**, **Questions for Your Doctor**) paired with interactive inline citation pills.
4. **Honest AI & Source Attribution:** Distinguish visually between facts retrieved from the user's **Private Vault** (emerald tint pill) and general medical knowledge verified via **External Authorities** such as WHO, NHS, or CDC (slate-blue citation chip).
5. **Zero-Friction Public Share Isolation:** The external `/share/[token]` view strips away all navigation chrome, branding clutter, and AI commentary—presenting solely the raw medical file and its expiration timer.

### 1.3 Anti-Patterns (What to Avoid)
* **No Generic AI Gradients or Glows:** Strictly ban purple-to-blue gradients, neon accent glows, glassmorphism blur cards, or floating ambient blobs.
* **No Sterile `#000000` / `#FFFFFF` Harshness:** Never use pure `#000000` black for text or borders; always use deep forest charcoal (`#14211D`) and sage-gray hairlines (`#DCE2DF`).
* **No Unbounded Border Radii:** Maintain disciplined corner geometry (`6px` small, `10px` medium, `14px` large)—never mix `24px` bubbly cards with sharp `2px` buttons.
* **No Cluttered Metric Dashboards:** Avoid fake health score rings, step counters, or unsolicited charts on the Vault home screen; prioritize immediate document retrieval and plain-English clarity.

---

## 2. Color System & Semantic Tokens

### 2.1 Surface & Background Tokens
| Token Name | Hex Value | RGB Value | Usage & Context |
| :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#F5F5F0` | `rgb(245, 245, 240)` | Primary page background (Warm Archival Stone). |
| `--bg-surface` | `#FFFFFF` | `rgb(255, 255, 255)` | Elevated document cards, summary panels, input fields, bottom nav bar. |
| `--bg-surface-subtle` | `#ECECE4` | `rgb(236, 236, 228)` | Secondary containers, inactive tab tracks, hover fills on canvas, table headers. |
| `--bg-surface-hover` | `#F7F8F6` | `rgb(247, 248, 246)` | Subtle interactive hover state on white surface cards and list rows. |
| `--bg-viewer-dark` | `#0E1513` | `rgb(14, 21, 19)` | Isolated dark canvas behind raw PDFs/images in `/vault/[documentId]` and `/share/[token]`. |
| `--bg-overlay` | `rgba(20, 33, 29, 0.52)` | `rgba(20, 33, 29, 0.52)` | Modal backdrop scrim (Deep Forest Charcoal at 52% opacity). |

### 2.2 Typography Color Tokens
| Token Name | Hex Value | RGB Value | Contrast on `#FFFFFF` | Usage & Context |
| :--- | :--- | :--- | :--- | :--- |
| `--text-primary` | `#14211D` | `rgb(20, 33, 29)` | `16.1:1` (AAA) | Headings, document titles, primary body text, active nav labels. |
| `--text-secondary` | `#4B5E58` | `rgb(75, 94, 88)` | `6.7:1` (AA+) | Descriptions, summary prose, metadata timestamps, inactive nav labels. |
| `--text-muted` | `#73857F` | `rgb(115, 133, 127)` | `3.8:1` (Large/UI) | Input placeholders, disabled states, helper captions, word-count hints. |
| `--text-inverted` | `#FFFFFF` | `rgb(255, 255, 255)` | `7.7:1` on `#1B5E4B` | Text/icons on primary emerald buttons, active profile chips, and dark viewer toolbars. |

### 2.3 Brand & Accent Tokens
| Token Name | Hex Value | RGB Value | Usage & Context |
| :--- | :--- | :--- | :--- |
| `--accent-primary` | `#1B5E4B` | `rgb(27, 94, 75)` | Primary CTAs (`Upload`, `Generate Link`), active navigation indicator, active focus ring. |
| `--accent-primary-hover` | `#144738` | `rgb(20, 71, 56)` | Hover state for primary buttons and interactive emerald links. |
| `--accent-primary-active` | `#0F362B` | `rgb(15, 54, 43)` | Pressed/active tactile state for primary buttons. |
| `--accent-primary-tint` | `#E6F0EC` | `rgb(230, 240, 236)` | Selected filter pills, active sidebar item background, Vault source citation badges. |
| `--accent-secondary` | `#2E6F65` | `rgb(46, 111, 101)` | Secondary interactive badges, doctor question bullet accents, progress indicators. |

### 2.4 Border & Divider Tokens
| Token Name | Hex Value | RGB Value | Usage & Context |
| :--- | :--- | :--- | :--- |
| `--border-hairline` | `#DCE2DF` | `rgb(220, 226, 223)` | Standard `1px` card borders, section dividers, bottom navigation top border. |
| `--border-strong` | `#B8C4BF` | `rgb(184, 196, 191)` | Card hover borders, unselected form input borders, secondary button outlines. |
| `--border-focus` | `#1B5E4B` | `rgb(27, 94, 75)` | Active input borders and keyboard focus outlines (`2px`). |

### 2.5 Semantic Status Tokens
| Status | Background Tint (`Hex` / `RGB`) | Border (`Hex` / `RGB`) | Text & Icon (`Hex` / `RGB`) | Clinical & App Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Success / Normal** | `#ECFDF5` / `rgb(236, 253, 245)` | `#A7F3D0` / `rgb(167, 243, 208)` | `#065F46` / `rgb(6, 95, 70)` | `Ready` ingestion badge, normal lab value flag, Google Calendar booked confirmation. |
| **Warning / Attention** | `#FFFBEB` / `rgb(255, 251, 235)` | `#FDE68A` / `rgb(253, 230, 138)` | `#92400E` / `rgb(146, 64, 14)` | `Attention` clinical flag, `Verify Patient Profile` badge, expiring link warning (`< 2h`). |
| **Danger / Critical** | `#FEF2F2` / `rgb(254, 242, 242)` | `#FECACA` / `rgb(254, 202, 202)` | `#991B1B` / `rgb(153, 27, 27)` | `Critical` medical flag on summary, `Ingestion Failed` alert, destructive delete/revoke actions. |
| **Info / External Source** | `#F0F9FF` / `rgb(240, 249, 255)` | `#BAE6FD` / `rgb(186, 230, 253)` | `#075985` / `rgb(7, 89, 133)` | Tavily external medical citations (`WHO`, `NHS`, `CDC`), 24-hour Gmail scanner alert badge. |

### 2.6 Family Profile Identity Palette (Deterministic Sub-Profile Pills)
To prevent caregivers from mixing up family members, each `FamilyProfile` is assigned a deterministic muted archival tag color based on creation order:
* **Primary (`Self`):** Background `#E6F0EC` · Border `#B7D4C8` · Text `#1B5E4B` (Botanical Emerald)
* **Dependent 1 (e.g., Spouse):** Background `#EEF2FF` · Border `#C7D2FE` · Text `#3730A3` (Archival Indigo)
* **Dependent 2 (e.g., Child 1):** Background `#FEF3C7` · Border `#FDE68A` · Text `#92400E` (Warm Ochre)
* **Dependent 3 (e.g., Child 2):** Background `#FCE7F3` · Border `#FBCFE8` · Text `#9D174D` (Muted Plum)
* **Dependent 4+:** Cycles cleanly through Sage (`#ECFDF5` / `#065F46`), Sky (`#F0F9FF` / `#075985`), and Stone (`#ECECE4` / `#14211D`).

---

## 3. Typography System

### 3.1 Font Families & Fallback Stacks
* **Heading Font (`--font-heading`):** `'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  * *Role:* Page titles, modal headers, summary section headers, empty-state headlines. Geometric clarity with warm human curves.
* **Body Font (`--font-body`):** `'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
  * *Role:* Plain-English AI summaries, streaming chat responses, form inputs, navigation labels, notifications. Engineered specifically for effortless long-form reading and high legibility at small mobile sizes.
* **Monospace Font (`--font-mono`):** `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace`
  * *Role:* Lab reference ranges, dosage figures, document dates, share link countdown timers, and citation domain tags (`who.int`, `nhs.uk`).

### 3.2 Complete Type Scale
| Scale Token | Font Family | Size (`rem` / `px`) | Weight | Line Height | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `Outfit` | `2.00rem` / `32px` | `600` (SemiBold) | `1.20` (`38px`) | `-0.02em` | Landing page hero headline (`/`). |
| **H1** | `Outfit` | `1.50rem` / `24px` | `600` (SemiBold) | `1.25` (`30px`) | `-0.015em` | Primary screen titles (`Family Vault`, `Activity Timeline`, `Document Detail`). |
| **H2** | `Outfit` | `1.25rem` / `20px` | `600` (SemiBold) | `1.30` (`26px`) | `-0.01em` | Modal titles (`Share Document`), AI Chat header, major card group headers. |
| **H3** | `Outfit` | `1.0625rem` / `17px` | `600` (SemiBold) | `1.35` (`23px`) | `-0.005em` | AI Summary block headers (`Overview`, `Key Findings`, `Questions for Your Doctor`). |
| **H4** | `Source Sans 3` | `1.00rem` / `16px` | `600` (SemiBold) | `1.40` (`22px`) | `0em` | Document card titles, notification headlines, form section labels. |
| **Body Large** | `Source Sans 3` | `1.0625rem` / `17px` | `400` (Regular) | `1.60` (`27px`) | `0em` | Plain-English AI Summary prose and AI Chat assistant messages (optimized for stress-free reading). |
| **Body Default** | `Source Sans 3` | `0.9375rem` / `15px` | `400` (Regular) | `1.50` (`22.5px`) | `0em` | Standard UI copy, timeline descriptions, modal descriptions, user chat bubbles. |
| **Small / Caption** | `Source Sans 3` | `0.8125rem` / `13px` | `500` (Medium) | `1.40` (`18px`) | `0.005em` | Card metadata (date, category, file size), form helper text, bottom nav labels. |
| **Micro / Label** | `JetBrains Mono` | `0.75rem` / `12px` | `500` (Medium) | `1.35` (`16px`) | `0.02em` | Status pills (`READY`, `CRITICAL`), profile badges, citation source chips, share countdowns. |

### 3.3 Readability & Clinical Formatting Rules
* **Prose Line Length Cap:** Plain-English AI summaries and AI Chat assistant responses must enforce a maximum measure of `64ch` (`~640px`) on desktop so eyes track cleanly from line to line without fatigue.
* **Tabular Numerals:** Apply `font-variant-numeric: tabular-nums` on all dates, file sizes, lab test values, share link expiration timers, and timeline timestamps so numbers align vertically in lists.
* **Structured AI Output Styling:** Inside AI Chat and Summary blocks, bold key clinical takeaways (`font-weight: 600` in `--text-primary`) and render doctor questions as clean numbered lists (`1.`, `2.`, `3.`) with `8px` vertical spacing between items.

---

## 4. Spacing, Layout Grid & Elevation System

### 4.1 Base Spatial Scale (`4px` Grid)
All margins, paddings, and layout gaps must strictly reference the following spacing tokens:
* `--space-1`: `4px` (`0.25rem`) — Tight icon-to-label gaps, inline badge padding.
* `--space-2`: `8px` (`0.50rem`) — Compact stack spacing, chip gaps, input label-to-field gap.
* `--space-3`: `12px` (`0.75rem`) — Internal card element gaps, dense list item padding.
* `--space-4`: `16px` (`1.00rem`) — Standard mobile page horizontal margin, card internal padding (mobile), grid gutter.
* `--space-5`: `20px` (`1.25rem`) — Card internal padding (desktop), modal section spacing.
* `--space-6`: `24px` (`1.50rem`) — Major vertical section spacing, modal outer padding.
* `--space-8`: `32px` (`2.00rem`) — Desktop content container padding, empty-state vertical padding.
* `--space-12`: `48px` (`3.00rem`) — Landing page section separation.

### 4.2 Container Widths & Layout Grid
* **Mobile App Shell (`< 768px`):** Single-column fluid layout with `16px` (`--space-4`) left/right page padding. Bottom clearance of `88px` to prevent content from hiding behind the fixed bottom navigation bar and floating Upload CTA.
* **Tablet Shell (`768px – 1023px`):** Single-column or 2-column card grid (`16px` gutter) with `24px` (`--space-6`) horizontal padding and left navigation rail (`72px` collapsed or `220px` expanded).
* **Desktop App Shell (`>= 1024px`):**
  * Left Navigation Rail: Fixed `240px` width.
  * Standard Content Max-Width (`/vault`, `/timeline`, `/profiles`, `/notifications`): `1040px` centered within the main workspace (`24px` gutter, 2-column card grid on `/vault`).
  * AI Chat Max-Width (`/chat`): `820px` centered conversation column for optimal `64ch` reading comfort.
  * Document Detail Split View (`/vault/[documentId]`): Full-bleed workspace (`100%` width up to `1440px`) divided `50%` left (Dark Raw Document Viewer) / `50%` right (Scrollable White AI Summary Panel).

### 4.3 Border Radius Scale
* **Small (`--radius-sm`: `6px`):** Status badges, family profile pills, citation chips, inline keyboard shortcuts, small icon buttons.
* **Medium (`--radius-md`: `10px`):** Primary/secondary buttons, text inputs, select dropdowns, chat message bubbles, timeline event rows.
* **Large (`--radius-lg`: `14px`):** Document cards, AI summary containers, modals, bottom sheets, Calendar confirmation cards.
* **Full (`--radius-full`: `9999px`):** Floating Upload `+` button, Profile Switcher filter pills, notification unread dot, user avatar.

### 4.4 Depth & Elevation System
MedBay uses **flat tactile layering** (`1px` hairline borders on `--bg-canvas`) rather than heavy drop shadows, reserving subtle elevation strictly for floating mobile actions and modals:
* **Level 0 — Canvas (`--elevation-0`):** `#F5F5F0` background, no border, no shadow.
* **Level 1 — Surface Card (`--elevation-1`):** `#FFFFFF` background + `1px solid #DCE2DF` (`--border-hairline`) + `0 1px 2px rgba(20, 33, 29, 0.04)`. Hover state shifts border to `#B8C4BF` (`--border-strong`).
* **Level 2 — Sticky Header & Bottom Bar (`--elevation-2`):** `#FFFFFF` (at 96% opacity with subtle backdrop settle) + `1px solid #DCE2DF` bottom/top border + `0 2px 8px rgba(20, 33, 29, 0.05)`.
* **Level 3 — Floating Upload CTA & Modals (`--elevation-3`):** `#FFFFFF` (or `#1B5E4B` for CTA) + `1px solid #DCE2DF` + `0 12px 32px -4px rgba(20, 33, 29, 0.14)`.

---

## 5. Reusable Component Specifications

### 5.1 Buttons
All buttons use `Source Sans 3` (`15px`, SemiBold `600`), `8px` icon-to-text gap, `--radius-md` (`10px`), and enforce a minimum `44px` height (`40px` compact inline variant on desktop only).

| Variant | Default State | Hover State | Focus State | Active / Pressed | Disabled State |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | Fill `#1B5E4B`, Text `#FFFFFF`, Border none | Fill `#144738` | `2px` outline `#1B5E4B` with `2px` `#F5F5F0` offset | Fill `#0F362B`, scale `0.985` | Fill `#DCE2DF`, Text `#73857F`, cursor `not-allowed` |
| **Secondary** | Fill `#E6F0EC`, Text `#1B5E4B`, Border `1px solid #B7D4C8` | Fill `#D6E7E0`, Border `#1B5E4B` | `2px` outline `#1B5E4B` with `2px` offset | Fill `#C6DDD4` | Fill `#ECECE4`, Text `#73857F`, Border `#DCE2DF` |
| **Outline** | Fill `#FFFFFF`, Text `#14211D`, Border `1px solid #B8C4BF` | Fill `#F7F8F6`, Border `#14211D` | `2px` outline `#1B5E4B` with `2px` offset | Fill `#ECECE4` | Fill `#F5F5F0`, Text `#73857F`, Border `#DCE2DF` |
| **Ghost** | Fill `transparent`, Text `#4B5E58`, Border none | Fill `#ECECE4`, Text `#14211D` | `2px` outline `#1B5E4B` with `2px` offset | Fill `#DCE2DF` | Text `#73857F`, opacity `0.6` |
| **Destructive** | Fill `#FEF2F2`, Text `#991B1B`, Border `1px solid #FECACA` | Fill `#991B1B`, Text `#FFFFFF`, Border `#991B1B` | `2px` outline `#991B1B` with `2px` offset | Fill `#7F1D1D`, Text `#FFFFFF` | Fill `#ECECE4`, Text `#73857F`, Border `#DCE2DF` |

### 5.2 Cards & Containers
* **Document Vault Card:**
  * *Layout:* White surface (`#FFFFFF`), `1px solid #DCE2DF`, `--radius-lg` (`14px`), `16px` padding.
  * *Anatomy:* Top row contains **Family Profile Pill** (left) + **AI Status / Critical Flag Badge** (right). Middle row displays **Document Title** (`H4`, max 2 lines truncated) and **Category + Document Date** (`Small`, `--text-secondary`). Bottom row displays a concise 1–2 line plain-English preview snippet (when `Ready`) or live step progress indicator (when `Processing`), plus a quick-action **Share Icon Button** (`44x44px` touch target).
  * *States:* Default (`--elevation-1`); Hover (`border-color: #B8C4BF`, subtle background `#F7F8F6`); Focus-visible (`2px` `#1B5E4B` ring).
* **AI Summary Block Card (`/vault/[documentId]`):**
  * *Layout:* White surface (`#FFFFFF`), `1px solid #DCE2DF`, `--radius-lg` (`14px`), `20px` padding, stacked with `16px` vertical gap.
  * *Anatomy:* Section header (`H3` + subtle left accent bar or icon) followed by `Body Large` (`17px`) prose. **Critical Flags** render inside a highlighted left-bordered callout strip (`3px` solid `#991B1B` for Critical, `#92400E` for Attention). **Verified Citations** sit in a footer strip as horizontal wrapping `Info` chips (`who.int`, `nhs.uk`, etc.) with external link icons.
* **Google Calendar Booking Confirmation Card (Inside `/chat`):**
  * *Layout:* `#ECFDF5` subtle emerald-green surface, `1px solid #A7F3D0`, `--radius-lg` (`14px`), `16px` padding.
  * *Anatomy:* Calendar check icon + `"Appointment Added to Google Calendar"` (`H4` in `#065F46`), Event Title, formatted Date/Time + Timezone (`tabular-nums`), Clinic/Location line, and an `"Open in Google Calendar"` outline action link.

### 5.3 Badges, Pills & Status Indicators
* **Family Profile Filter Pills (Top Switcher):** `--radius-full`, `36px` visual height inside a `44px` touch wrapper, `12px` horizontal padding. Inactive state: `#FFFFFF` fill, `1px solid #DCE2DF`, `#4B5E58` text. Active state: `#1B5E4B` fill, `#FFFFFF` text, SemiBold.
* **Ingestion & Clinical Status Badges:** `--radius-sm` (`6px`), `4px 8px` padding, `JetBrains Mono` `12px` uppercase:
  * `READY`: `#ECFDF5` fill / `#065F46` text / `#A7F3D0` border.
  * `PROCESSING` (`Reading...` / `Summarizing...`): `#E6F0EC` fill / `#1B5E4B` text + subtle pulsing dot.
  * `ATTENTION` / `VERIFY PATIENT`: `#FFFBEB` fill / `#92400E` text / `#FDE68A` border.
  * `CRITICAL FLAG`: `#FEF2F2` fill / `#991B1B` text / `#FECACA` border.
* **Citation Source Chips:**
  * *Vault Citation Chip:* `#E6F0EC` fill, `#1B5E4B` text, document icon + `Document Title (Date)`, `--radius-sm`. Tapping navigates to `/vault/[documentId]`.
  * *External Medical Citation Chip:* `#F0F9FF` fill, `#075985` text, globe/shield icon + domain (`who.int`, `nhs.uk`, `cdc.gov`), `--radius-sm`. Tapping opens source URL in a new tab (`rel="noopener noreferrer"`).

### 5.4 Modals, Drawers & Confirmation Dialogs
* **Mobile Behavior (`< 768px`):** Render as bottom sheets anchored to the viewport bottom with top-left/top-right `--radius-lg` (`14px`), a `36px x 4px` drag handle indicator (`#B8C4BF`) centered at the top, and `20px` padding.
* **Desktop Behavior (`>= 768px`):** Render as centered dialogs (`max-width: 480px` for Share/Add Profile, `max-width: 560px` for Upload) over `--bg-overlay`, `--radius-lg` (`14px`), `--elevation-3`, with a top-right `44x44px` Close (`X`) ghost button.
* **Destructive Confirmation Dialog:** Used when deleting a document, deleting a family sub-profile, or revoking an active share link. Requires explicit action confirmation button (`Destructive` variant) paired with a `Cancel` (`Outline`) button.

### 5.5 Lists & Timeline Display Items
* **Activity Timeline Row (`/timeline`):**
  * *Structure:* Grouped under sticky date headers (`Today`, `Yesterday`, `Nov 15, 2026`). Each row sits on a `--bg-surface` container (`1px solid #DCE2DF`, `--radius-md`) with a left `36px` circular event-type icon badge, center description (`Body Default`) + **Family Profile Pill**, and right-aligned timestamp (`JetBrains Mono`, `12px`, `--text-muted`). Entire row is tappable (`min-height: 60px`) when linked to a document, chat, or notification.

### 5.6 Toast Notifications & Alerts
* **Toast Banner:** Anchored top-center on desktop and above the bottom navigation bar on mobile (`bottom: 84px`). Max width `420px`, `#14211D` dark charcoal surface with `#FFFFFF` text, `--radius-md` (`10px`), semantic left icon, and auto-dismiss after `4000ms` (with manual close button).
* **Persistent Top Inline Alert Banner:** Full-width subtle strip below the top header for actionable system states (e.g., Google OAuth scope disconnected or Offline PWA mode).

---

## 6. Navigation & Form UX Rules

### 6.1 Primary Navigation Architecture
* **Mobile PWA Shell (`< 768px`):**
  * **Top Sticky Header (`56px` height):** Left displays the **MedBay** emblem + active **Family Profile Switcher** dropdown trigger; Right displays the **Notification Bell** (`44x44px` touch target) with an unread badge count (`#991B1B` fill, `#FFFFFF` text).
  * **Bottom Fixed Navigation Bar (`68px` height + safe-area inset):** 5 balanced slots:
    1. **Vault** (`/vault`)
    2. **AI Chat** (`/chat`)
    3. **Center Floating Upload Button (`+`)** (`52px x 52px` circle in `#1B5E4B`, lifted `10px` above the bar with `--elevation-3`)
    4. **Timeline** (`/timeline`)
    5. **Family** (`/profiles`)
  * *Active Route Indicator:* Active tab icon and label switch to `#1B5E4B` (`SemiBold`), topped by a `24px x 3px` emerald indicator pill.
* **Desktop App Shell (`>= 768px`):**
  * **Collapsible Left Navigation Rail (`240px` expanded):** Top houses the **MedBay** wordmark + vault icon, followed by a full-width primary **Upload Document** button (`#1B5E4B`), primary navigation items (**Vault**, **AI Chat**, **Timeline**, **Family & Settings**), and bottom utility items (**Notifications** with count badge + user Google avatar/sign-out).
  * *Active Route Indicator:* `#E6F0EC` pill background with `#1B5E4B` text and `SemiBold` weight.
* **Breadcrumbs:** Displayed only on sub-pages (`/vault/[documentId]`) as a clean back-navigation bar: `← Back to Vault / [Profile Name] / [Document Title]`.

### 6.2 Form UX & Validation Standards
* **Input Dimensions:** Standard text inputs and select dropdowns use `44px` height, `12px` horizontal padding, `--radius-md` (`10px`), `#FFFFFF` background, `1px solid #B8C4BF` border, and `15px` `Source Sans 3` text.
* **Label Placement:** Always top-aligned labels (`14px`, SemiBold `#14211D`) positioned `6px` above the input field. Never rely solely on placeholder text as a label.
* **Required Indicators:** Mark required fields with a subtle `(Required)` text tag or `#991B1B` asterisk; explicitly label optional fields such as `Date of Birth (Optional)`.
* **Validation Timing:** Validate on blur (`onBlur`) for field-level formatting and on submit (`onSubmit`). Display inline error messages immediately below the input (`13px` in `#991B1B` with an alert icon) and shift input border to `#991B1B`.
* **Submit Button Behavior:** Disable submit triggers during active network requests and replace button label with an inline spinner + active verb (e.g., `"Uploading..."`, `"Generating Link..."`, `"Saving Profile..."`) to prevent duplicate submissions.

---

## 7. UI Feedback States (Loading, Empty & Error States)

### 7.1 Loading States & CLS Prevention
* **Skeleton Loaders:** `/vault`, `/timeline`, and `/notifications` render structural skeleton cards matching exact card heights (`112px` for Vault cards, `64px` for Timeline rows) using an animated shimmer between `#ECECE4` and `#E2E5DF` so zero Cumulative Layout Shift (`CLS = 0`) occurs when data resolves.
* **Document Ingestion Step Progress:** Newly uploaded documents appear immediately at the top of `/vault` with an interactive step pill progressing smoothly through `Uploading file...` -> `Reading & OCR...` -> `Writing plain-English summary...` -> `Ready`.
* **AI Chat Streaming Indicator:** Upon sending a prompt, immediately render the assistant message container with a subtle live status pill (`"Searching [Profile]'s records..."`, `"Verifying medical sources..."`, or `"Scheduling on Google Calendar..."`) before streaming text tokens with a blinking `2px` emerald cursor (`#1B5E4B`).
* **Public Share Link Loader (`/share/[token]`):** Centered minimal card on `#0E1513` dark canvas displaying a subtle emerald spinner and `"Verifying secure link..."` until the signed document stream mounts.

### 7.2 Empty States
Every empty state centers an `80px` custom line-art illustration in `#1B5E4B` and `#4B5E58` strokes, an `H2` headline, a concise 1–2 sentence `Body Default` explanation (`max-width: 360px`), and one clear primary CTA:
* **Empty Vault (First-Time User):**
  * *Headline:* `"Your family's medical vault is ready"`
  * *Copy:* `"Upload a lab result, prescription, or scan to get an instant plain-English summary and keep it ready anywhere."`
  * *CTA:* Primary button `"Upload First Document"` + Secondary button `"Add Family Member"`.
* **Empty Sub-Profile Filter:**
  * *Headline:* `"No records for [Profile Name] yet"`
  * *Copy:* `"Documents uploaded with [Profile Name]'s name will automatically appear here."`
  * *CTA:* Primary button `"Upload for [Profile Name]"`.
* **Empty AI Chat Thread:**
  * *Headline:* `"Ask about [Profile Name]'s health records"`
  * *Copy:* `"Answers are grounded strictly in [Profile Name]'s uploaded documents and verified medical sources."`
  * *Starter Chips (3 tappable `Outline` pills):* `"Summarize recent lab results"` · `"What questions should I ask my doctor?"` · `"Book a doctor appointment on my calendar"`.
* **Empty Notifications:**
  * *Headline:* `"No new medical emails detected"`
  * *Copy:* `"MedBay automatically scans your connected Gmail every 24 hours for lab notices, prescriptions, and clinic updates."`
* **Empty Timeline:**
  * *Headline:* `"No vault activity yet"`
  * *Copy:* `"Uploads, AI summaries, shared links, and booked appointments will appear here chronologically."`

### 7.3 Error & Fallback States
* **File Validation Rejection (Client-Side):** Immediate toast banner before upload begins: `"Unsupported file or size over 25 MB. Please select a JPEG, PNG, WebP, PDF, DOCX, or TXT file."`
* **AI Ingestion Failure:** Card remains accessible in `/vault` with a `Danger` badge (`"AI Summary Failed"`), allowing the user to view/share the raw document while offering a one-tap `"Retry Summary"` button.
* **Expired or Revoked Share Link (`/share/[token]`):** Centered card on `#F5F5F0` canvas with a lock-clock icon, `"Link Expired or Revoked"` (`H2`), and `"This medical document link is no longer active. Please ask the document owner to generate a new share link."` Reveals zero document titles, patient names, or account details.
* **404 Not Found & 500 Server Error:** Full-page centered error screen with clear explanation and a `"Return to Vault"` primary button.
* **Offline PWA Mode:** Persistent top banner (`#FFFBEB` background, `#92400E` text): `"You're offline — Viewing cached screens. Uploads and AI chat will resume once reconnected."`

---

## 8. Micro-Interactions & Motion Guidelines

* **Timing & Easing Curves:**
  * *Micro-Interactions (button hover, pill selection, focus rings):* `150ms` `cubic-bezier(0.2, 0, 0, 1)`.
  * *Card Expansion, Dropdowns & Toasts:* `200ms` `cubic-bezier(0.16, 1, 0.3, 1)`.
  * *Modals & Mobile Bottom Sheets:* `250ms` slide-up / fade-in using `cubic-bezier(0.16, 1, 0.3, 1)`; `180ms` exit.
* **Tactile Feedback:** Primary buttons scale subtly to `0.985` on press (`:active`) to feel physical and responsive on mobile touchscreens.
* **Streaming Text Smoothness:** Incoming LLM tokens render progressively without layout jitter; chat auto-scrolls smoothly only while the user is anchored near the bottom of the thread, pausing auto-scroll if the user scrolls up to read earlier citations.
* **Reduced Motion Compliance:** When `@media (prefers-reduced-motion: reduce)` is active, disable all transform translations, bottom-sheet slide animations, and pulsing dots, replacing them with instant `100ms` opacity cross-fades.

---

## 9. Responsive Behavior & Breakpoints

### 9.1 Breakpoint System
* **`xs` (Mobile Default):** `0px – 639px` (Primary design target: `375px` & `390px` mobile PWA viewports)
* **`sm` (Large Mobile / Phablet):** `640px – 767px`
* **`md` (Tablet):** `768px – 1023px`
* **`lg` (Desktop):** `1024px – 1279px`
* **`xl` (Wide Desktop):** `1280px+`

### 9.2 Cross-Device Adaptation Rules
| Component / View | Mobile (`< 768px`) | Tablet (`768px – 1023px`) | Desktop (`>= 1024px`) |
| :--- | :--- | :--- | :--- |
| **Primary Navigation** | Top sticky header + fixed bottom 5-slot tab bar with centered floating `+` CTA | Collapsible `72px` icon rail + top profile header | Fixed `240px` left navigation sidebar with full labels |
| **Vault Document Grid (`/vault`)** | 1-column full-width card stack (`12px` gap) | 2-column grid (`16px` gap) | 2-column grid (`20px` gap) inside `1040px` container |
| **Document Detail (`/vault/[documentId]`)** | Single-pane view switched via sticky top segmented tabs (`AI Summary` \| `Original File`) | Single-pane view with segmented tabs | **50/50 Split-Screen:** Dark Raw Document Viewer pinned left; White AI Summary pinned right |
| **Modals (`Upload`, `Share`, `Add Profile`)** | Bottom slide-up sheet (`100%` width, rounded top corners) | Centered dialog (`480px` max width) | Centered dialog (`480px–560px` max width) |
| **AI Chat (`/chat`)** | Full-bleed edge-to-edge message stream with sticky bottom composer above safe-area | Centered `680px` message column | Centered `820px` message column with persistent thread history drawer |
| **Public Share Viewer (`/share/[token]`)** | Compact `48px` top bar (Document Title + Expiry Timer + Download icon) + full-height document canvas | Centered `64px` top header + full-height document canvas | Centered `64px` top header (`max-width: 1120px` viewer frame) + download button |

---

## 10. Accessibility (a11y) Standards

* **Contrast Ratios:** All primary and secondary text meets or exceeds WCAG 2.1 AA (`4.5:1` minimum for normal text, `3:1` for large text and UI boundaries). Core text tokens (`#14211D` on `#FFFFFF` at `16.1:1`, `#FFFFFF` on `#1B5E4B` at `7.7:1`) achieve WCAG AAA.
* **Visible Keyboard Focus Rings:** Every interactive control (buttons, inputs, profile pills, citation chips, document cards) must display a high-contrast `2px solid #1B5E4B` focus ring with a `2px` offset (`:focus-visible`).
* **Touch Targets:** Every interactive tap target on mobile and tablet must measure at least `44px x 44px` with at least `8px` spacing between adjacent interactive elements (such as citation pills or share/delete icons).
* **Semantic Structure & ARIA:**
  * Use semantic landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`).
  * Mark the AI Chat streaming container with `aria-live="polite"` so screen readers announce completed responses without interrupting token-by-token.
  * Provide descriptive `aria-label` attributes on icon-only controls (`Notification Bell`, `Share Document`, `Close Modal`, `Upload Document`).
  * Ensure modals trap keyboard focus while open and close cleanly on `Escape`.

---

## 11. Page-by-Page Layout Blueprint

### 11.1 `/` — Landing & PWA Entry (`Public Marketing / Onboarding Shell`)
* **Top Bar:** MedBay emblem + wordmark (left) and `"Sign In"` ghost button (right).
* **Hero Section:** Single-column centered layout (`max-width: 680px`), `Display` headline (`"Your family's medical records, understood and ready anywhere."`), concise subheadline, primary `"Continue with Google"` button (`48px` height with Google mark), and a subtle `"Install MedBay App"` PWA prompt badge.
* **3-Card Value Grid:** Three horizontal cards (`--elevation-1`) highlighting: (1) *Family Vault & Sub-Profiles*, (2) *Plain-English AI Summaries with WHO/NHS Citations*, and (3) *One-Click Expiring Emergency Links*.
* **Footer:** Privacy & encryption note + medical disclaimer.

### 11.2 `/login` — Authentication Screen (`Auth Centered Card Shell`)
* **Layout:** Centered card (`max-width: 420px`) on `#F5F5F0` canvas.
* **Top-to-Bottom Hierarchy:** MedBay emblem -> `H2` `"Sign in to MedBay"` -> concise explanation of requested Google permissions (Vault login, Google Calendar appointment booking, and read-only 24-hour Gmail medical scan) -> Primary `"Continue with Google"` CTA -> Medical informational disclaimer caption.

### 11.3 `/vault` — Family Medical Vault (`App Shell — Home`)
* **Top Sticky Header:** Active **Family Profile Switcher** horizontal scrollable pill row (`All Family`, `Self`, plus color-coded dependent pills) + **Notification Bell** button (right).
* **Search & Filter Bar:** Full-width `44px` search input (`"Search labs, prescriptions, doctors..."`) paired with horizontal category filter chips (`All`, `Lab Report`, `Prescription`, `Imaging`, `Discharge`).
* **Document Feed:** 1-column (mobile) or 2-column (desktop) grid of **Document Vault Cards** sorted newest first. Cards flagged with `needs_review` display an inline `"Confirm Patient"` pill prompt.
* **Floating Action (Mobile) / Sidebar CTA (Desktop):** Primary `#1B5E4B` **Upload (`+`)** button.

### 11.4 `/vault/upload` — Document Upload Modal / Bottom Sheet
* **Header:** `H2` `"Add Medical Document"` + Close (`X`) button.
* **Dropzone / Capture Area:** Dashed `1.5px solid #B8C4BF` zone (`#F7F8F6` fill, `--radius-lg`) with two clear mobile triggers: **"Take Photo"** (opens device camera) and **"Choose File"** (PDF, Image, DOCX, TXT up to 25 MB).
* **Profile Pre-Selection:** Horizontal pill selector (`Auto-Detect from Document` selected by default, or manual tap on `Self` / dependent profile).
* **Action Footer:** Full-width Primary button `"Upload & Analyze"`.

### 11.5 `/vault/[documentId]` — Document Detail & AI Summary (`App Detail Shell`)
* **Top Navigation Bar:** `← Vault` back button, editable **Family Profile Assignment Dropdown**, **Share** primary/secondary button (`#1B5E4B`), and `...` overflow menu (`Reassign Profile`, `Retry AI Analysis`, `Delete Document`).
* **Mobile View (`< 1024px`):** Sticky segmented tab control (`AI Summary` | `Original Document`) switching between the two panes below.
* **Desktop View (`>= 1024px`):** 50/50 split-screen:
  * **Left Pane (`#0E1513` Dark Canvas):** Interactive zoomable PDF/image/document viewer with page controls and download button.
  * **Right Pane (`#F5F5F0` Scrollable Column):**
    1. Document Title (`H1`), Document Date, Category badge, and Patient Match status.
    2. **Card 1 — Plain-English Overview:** `Body Large` (`17px`) summary explaining the document clearly.
    3. **Card 2 — Key Findings & Critical Flags:** Bulleted findings with `Normal`, `Attention`, or `Critical` left-accent strips.
    4. **Card 3 — Questions to Ask Your Doctor:** 2–4 concise numbered questions + `"Ask AI Follow-Up Questions"` button linking directly into `/chat`.
    5. **Card 4 — Verified Medical Citations:** Clickable external source chips (`who.int`, `nhs.uk`, etc.) + subtle medical disclaimer footer.

### 11.6 `Modal: Share` — Expiring Share Link Modal / Sheet
* **Header:** `H2` `"Share Original Document"` + privacy reassurance badge (`"Only the raw file is shared. AI summaries stay private."`).
* **Expiration Selector:** 3-segment radio card group (`24 Hours`, `7 Days` default, `30 Days`).
* **Generated Link Box:** Read-only `JetBrains Mono` URL field + one-tap `"Copy Link"` primary button and native `"Share..."` button.
* **Active Links List:** Compact list of existing unexpired links for this document showing expiration countdown (`tabular-nums`), view count, and a `"Revoke"` destructive ghost button.

### 11.7 `/chat` — Personalized RAG & Action Chat (`App Shell`)
* **Top Context Bar:** Active **Profile Scope Lock Pill** (`"Chatting about: [Profile Name]"` with quick profile switcher) + `"New Thread"` button + Thread History drawer toggle.
* **Message Stream (`max-width: 820px` centered):**
  * *User Messages:* Right-aligned `#1B5E4B` bubbles with `#FFFFFF` text (`--radius-lg`).
  * *Assistant Messages:* Left-aligned `#FFFFFF` cards (`1px solid #DCE2DF`, `--radius-lg`) with structured Markdown, inline **Vault Source Chips** (`#E6F0EC`), **External Citation Chips** (`#F0F9FF`), and rich **Google Calendar Confirmation Cards** when appointments are booked.
* **Bottom Sticky Composer:** Auto-expanding `textarea` (`min-height: 48px`, `max-height: 140px`) inside a `#FFFFFF` pill container (`1px solid #B8C4BF`) with a right-aligned `40x40px` `#1B5E4B` Send button.

### 11.8 `/timeline` — Activity Timeline (`App Shell`)
* **Header:** `H1` `"Activity Timeline"` + horizontal filter bar (Profile filter dropdown + Event Category chips: `All`, `Uploads`, `Shares`, `Appointments`, `Gmail Alerts`).
* **Feed Layout:** Single-column centered feed (`max-width: 760px`) grouped under sticky date headers (`Today`, `Yesterday`, specific dates) containing tappable **Activity Timeline Rows**.

### 11.9 `/profiles` — Family Profiles & Settings (`App Shell`)
* **Section 1 — Family Vault Profiles:** Card grid showing the `Self` primary card and each managed dependent card (Name, Relationship badge, optional DOB, document count, and `Edit` / `Delete` actions), topped by an `"+ Add Family Member"` primary button (opens modal requiring only `Full Name`, `Relationship`, and optional `Date of Birth`).
* **Section 2 — Connected Google Services:** Status card displaying connected Google email, **Google Calendar** (`Active` green pill), **24-Hour Gmail Medical Scanner** (`Active` toggle switch + last scan timestamp), and a `"Reconnect Google Permissions"` outline button.
* **Section 3 — Device Notifications & Session:** Web Push notification toggle switch (`Enable Mobile/Desktop Alerts`) + `"Sign Out"` outline button.

### 11.10 `/notifications` — Notification Center (`Drawer on Desktop / Page on Mobile`)
* **Header:** `H2` `"Notifications"` + `"Mark All Read"` ghost button.
* **Notification List:** Cards for each 24-hour Gmail scan alert showing unread emerald dot, email subject (`H4`), sender address, snippet preview, attachment badge, timestamp, and a one-tap `"Import to Vault"` secondary button alongside `"Dismiss"`.

### 11.11 `/share/[token]` — Public Raw Document Viewer (`Standalone Minimal Shell`)
* **Top Minimal Header (`56px` height, `#14211D` dark surface):** Left displays document title (`#FFFFFF`, truncated) and `"Shared via MedBay"` subtle label; Right displays expiration countdown badge (`"Expires in 23h 40m"`, `JetBrains Mono`) and a `"Download"` icon button (`44x44px`).
* **Main Viewer Canvas (`#0E1513` full viewport height minus header):** Embedded raw PDF/image/document renderer centered cleanly with zoom controls. Contains **zero** AI summaries, doctor questions, citations, chat links, or user profile metadata.