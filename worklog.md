---
Task ID: 1
Agent: Main Orchestrator
Task: Build "من الفكرة.. إلى السيستم" Arabic RTL digital agency website

Work Log:
- Explored existing project structure (Next.js 16, Tailwind CSS 4, shadcn/ui, framer-motion)
- Planned full page architecture with 7 components
- Set up foundation: layout.tsx (Arabic RTL with Cairo font), globals.css (emerald/amber custom theme), prisma schema (Lead model), API route (/api/leads)
- Built all frontend components in parallel via subagents:
  - Hero Section with animated digital transformation visual (4-phase looping animation)
  - Growth Spectrum with 4 interactive stage cards (horizontal on desktop, timeline on mobile)
  - Configurator with 3 toggle cards, dynamic recommendation, and lead capture form
  - Case Studies with 6 projects, filter buttons, Problem→Solution format
  - Why Us with 3 feature cards and counting stats
  - Navbar with responsive mobile menu (Sheet from right)
  - Footer with 3-column layout and sticky behavior
- Assembled page.tsx with proper section IDs for smooth scroll navigation
- Verified with Agent Browser: all sections render, navigation works, mobile menu works, API endpoint works, no errors

Stage Summary:
- Complete Arabic RTL digital agency website with 5 interactive sections
- Emerald/amber color scheme (no indigo/blue)
- Cairo Arabic font with proper RTL direction
- Lead capture API with Prisma/SQLite backend
- All framer-motion animations and shadcn/ui components
- Responsive design tested on both mobile (390x844) and desktop (1440x900)

---
Task ID: pb-full
Agent: frontend-developer
Task: Replace thin ProjectBuilder wrapper with a full 6-stage interactive wizard

Work Log:
- Read existing thin wrapper at src/components/sections/project-builder.tsx (13 lines, just rendered Configurator inside <section id="project-builder">)
- Reviewed supporting infrastructure: useLanguage hook (@/hooks/use-language returns {t, dir, lang}), useToast hook, framer-motion, shadcn/ui components (Card, Button, Input, Textarea, Badge all available), /api/project-requests route already exists with matching payload schema (ProjectRequest Prisma model)
- Added ~130 new translation keys (pb* prefix) to BOTH `ar` and `en` blocks of src/lib/i18n.ts so the `en: typeof ar` typed object stays consistent. Keys cover: header/badge/stage titles, 6 stage hints, 8 industries, 7 aspects, 10 features, 4 styles, 6 colors, 3 fonts, 5 budgets, 4 timelines, 4 contact methods, 4 best times, validation errors, navigation labels, success screen text
- Rewrote src/components/sections/project-builder.tsx as a full 'use client' 6-stage wizard:
  - Constants: MAX_SITES=5, MAX_COLORS=3, STORAGE_KEY='webarea-project-builder', COLOR_OPTIONS (6 entries with key/hex/labelKey)
  - Helper components defined OUTSIDE main: StageHint (blue Info box) and FieldBadge (required=rose, optional=muted)
  - State: stage (1-7), data (ProjectData), isSubmitting, referenceNumber, hydrated
  - Two useEffects: load from localStorage on mount (gated on hydrated), save on data change
  - update<K>() generic field setter; toggleArrayItem pure helper; addSite/updateSite/removeSite for nested ref sites
  - handleNext: validates stage 1 (industry required; industryOther required when 'other'); clamps to 6
  - handlePrev: clamps to 1
  - handleSubmit: validates contactMethod/name/email(@)/phone(when whatsapp|phone)/bestTime; POSTs to /api/project-requests; on success sets referenceNumber, setStage(7), clears data + localStorage
  - handleReset: back to stage 1, clears everything
  - copyReference: clipboard + toast
  - progress = (min(stage,6)/6)*100
  - 6 stage circles (clickable to jump back if completed, Check icon + gradient fill when done, scale-110 when current), gradient progress bar fill
  - AnimatePresence (mode=wait) keyed by stage for slide transitions; RTL-aware x direction
  - Stage 1: StageHint + 8-item industry grid (2 cols mobile / 4 desktop) + conditional 'other' Input + description Textarea (FieldBadge optional)
  - Stage 2: StageHint + dynamic URL list (numbered, AnimatePresence enter/exit) + Add site button when < MAX_SITES, empty state message
  - Stage 3: StageHint + per-filled-site Card (URL header with Globe icon, aspect chips, notes Textarea) or skip message when no sites
  - Stage 4: StageHint + features checkboxes (2 col grid) + styles (4 col) + colors with hex circles and 3/3 counter + fonts (3 col) + budget/timeline (2 col)
  - Stage 5: 3 review Cards (industry/desc, ref sites with counts, requirements with feature badges + color dots + style/font/budget/timeline summary), each with Edit button jumping to corresponding stage
  - Stage 6: StageHint + 4 contact method buttons + name/email (always) + phone (animated conditional on whatsapp/phone) + 4 best time buttons
  - Navigation: Previous (when stage>1) + Skip (stages 2-3) + Next (when stage<6) or Submit (stage 6, with Loader2 spinner when submitting). Arrow icon direction flips for RTL (ArrowLeft) vs LTR (ArrowRight)
  - Stage 7 (success): spring-rotated gradient check circle, success title/desc, reference number box with copy button, "send another" button
- All visible text comes from t.* keys (zero hardcoded Arabic). Section has dir={dir}.
- Verified: `bun run lint` passes clean (0 errors/warnings). dev.log shows GET / 200 after the i18n.ts changes (Fast Refresh did a full reload as expected, no compile errors).

Stage Summary:
- Full 6-stage interactive project-request wizard that persists to localStorage and submits to existing /api/project-requests endpoint
- Gradient (blue→amber) visual identity throughout: badge, progress bar, stage circles, success circle, primary CTA buttons
- RTL/LTR aware: ArrowLeft for RTL next, ArrowRight for LTR next; text-start alignment; logical ms-* / me-* spacing
- 130+ bilingual translation keys added to i18n.ts (ar + en) for full localization
- Validation with toast feedback at every required gate; auto-save indicator with pulsing dot
- Review screen lets users jump back to stages 1/2/4 to edit prior selections
