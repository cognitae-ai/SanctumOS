# SanctumOS v1.0.0 — Folder Structure

> Create this entire structure before the IDE agent begins work.
> Files marked ★ are pre-built and should be placed in their positions.
> Everything else is for the IDE agent to populate.

```
sanctumos/
│
├── .env.local.example          ★ Environment variable spec
├── .env.local                  (Your actual keys — gitignored)
├── .eslintrc.json              (IDE generates — strict TS rules)
├── .gitignore                  (IDE generates)
├── .husky/
│   └── pre-commit              (IDE generates — runs tsc + eslint)
├── next.config.ts              (IDE generates)
├── package.json                (IDE generates)
├── pnpm-lock.yaml              (IDE generates)
├── postcss.config.js           (IDE generates — Tailwind)
├── tailwind.config.ts          ★ Exact C color map, animations, typography
├── tsconfig.json               (IDE generates — strict mode)
│
├── docs/
│   ├── CHRONICLE.md            (Entry 001: Infrastructure Manifest)
│   └── ARCHITECTURE.md         (This file — folder structure rationale)
│
├── public/
│   ├── manifest.json           ★ PWA config
│   ├── icon-192.png            (You provide — app icon)
│   ├── icon-512.png            (You provide — app icon)
│   ├── noise.svg               (IDE generates — subtle texture overlay)
│   └── og-default.png          (You provide — default Open Graph image)
│
├── supabase/
│   ├── config.toml             (IDE generates — local dev config)
│   └── migrations/
│       └── 001_genesis.sql     ★ Full schema: 6 tables, RLS, functions
│
└── src/
    │
    ├── app/                          ─── ROUTING (Next.js App Router)
    │   ├── layout.tsx                Root layout: fonts, theme, metadata
    │   ├── page.tsx                  Entry point: Velvet Rope check → app
    │   ├── globals.css               Tailwind directives + custom styles
    │   │
    │   ├── (auth)/                   Auth routes (no app chrome)
    │   │   ├── login/
    │   │   │   └── page.tsx          Magic Link login
    │   │   ├── callback/
    │   │   │   └── route.ts          Supabase auth callback handler
    │   │   └── gate/
    │   │       └── page.tsx          Velvet Rope password screen
    │   │
    │   ├── (app)/                    Authenticated app routes
    │   │   ├── layout.tsx            App shell: SplitLayout + auth guard
    │   │   ├── page.tsx              Welcome / home screen
    │   │   ├── session/
    │   │   │   └── [id]/
    │   │   │       └── page.tsx      Active session (dialogue flow)
    │   │   └── settings/
    │   │       └── page.tsx          User settings / profile
    │   │
    │   ├── share/
    │   │   └── [slug]/
    │   │       ├── page.tsx          Public artifact view (no auth)
    │   │       └── opengraph-image.tsx  Dynamic OG image generation
    │   │
    │   └── api/                      API routes (server-only)
    │       └── health/
    │           └── route.ts          Health check endpoint
    │
    ├── components/                   ─── THE SHELL (UI)
    │   │
    │   ├── layout/                   Layout system
    │   │   ├── SplitLayout.tsx       Main split-panel: sidebar + content
    │   │   ├── Sidebar.tsx           Sidebar container with toggle
    │   │   ├── DragHandle.tsx        Resizable panel handle
    │   │   ├── MobileTabBar.tsx      Menu / Session tab switcher
    │   │   └── VelvetRope.tsx        Password gate component
    │   │
    │   ├── sidebar/                  Sidebar views
    │   │   ├── NotesView.tsx         Notes panel (channels, note cards)
    │   │   ├── SessionsView.tsx      Sessions panel (history, carrying, log)
    │   │   ├── ChannelList.tsx       Channel selector + custom channel creation
    │   │   ├── NoteCard.tsx          Individual note with expand/pin/edit/delete
    │   │   ├── SessionCard.tsx       Session history item
    │   │   ├── CarryingCard.tsx      Carrying item with settle/explore
    │   │   └── ShiftLogTimeline.tsx  Timeline dots for shift log
    │   │
    │   ├── session/                  Session flow components
    │   │   ├── WelcomeScreen.tsx     Logo, mode cards, style selector, pins
    │   │   ├── ShiftInScreen.tsx     Arrival prompt ("What are you sitting with?")
    │   │   ├── DialogueView.tsx      Exchange loop UI
    │   │   ├── SynthesizingView.tsx  Artifact generation loading state
    │   │   ├── ResultView.tsx        Artifact display + actions
    │   │   ├── ModeCard.tsx          Session mode selector card
    │   │   ├── StyleSelector.tsx     Mirror / Lantern toggle
    │   │   └── PhaseBar.tsx          Triadic progress indicator
    │   │
    │   ├── artifact/                 Artifact display
    │   │   ├── ArtCard.tsx           The clarity card (full artifact)
    │   │   ├── ArtCardPublic.tsx     Read-only public version
    │   │   └── ArtCardPrint.tsx      Print-optimised version
    │   │
    │   ├── chat/                     Conversation UI
    │   │   ├── MessageBubble.tsx     Single message (user or guide)
    │   │   ├── ChatInput.tsx         Text input + send
    │   │   └── StreamingText.tsx     Animated text during AI response
    │   │
    │   ├── shared/                   Reusable primitives
    │   │   ├── Dots.tsx              Loading dots (breathing animation)
    │   │   ├── Toast.tsx             Non-blocking notification
    │   │   ├── ConfirmDialog.tsx     Destructive action confirmation
    │   │   ├── TriadLegend.tsx       Episteme/Techne/Phronesis legend
    │   │   ├── PhaseDots.tsx         Phase indicator dots
    │   │   └── Logo.tsx              Sanctum logo + triadic dots
    │   │
    │   └── onboarding/              First-time experience
    │       ├── OnboardModal.tsx      Welcome overlay
    │       └── PhilosophyPage.tsx    The Triadic Method explanation
    │
    ├── lib/                          ─── THE GHOST + SPINE (Logic + Data)
    │   │
    │   ├── types.ts                ★ All TypeScript types and interfaces
    │   │
    │   ├── soul/                     The Soul (System Prompts)
    │   │   ├── index.ts            ★ Prompt assembly: buildSystemPrompt, etc.
    │   │   ├── prompts.ts          ★ SKELETON, ORGANS, MUSCLES, SKIN, SAFETY
    │   │   └── modes.ts            ★ Session modes, phases, triadic config
    │   │
    │   ├── brain/                    The Ghost (AI Intelligence)
    │   │   ├── index.ts              Adapter factory: picks model by tier
    │   │   ├── ModelAdapter.ts       Interface definition
    │   │   ├── AnthropicAdapter.ts   Claude Sonnet 4 / Opus 4 implementation
    │   │   ├── FineTuneAdapter.ts    Beta placeholder (checks SANCTUM_FINE_TUNE_ID)
    │   │   └── sanitize.ts           Input sanitization (strip HTML, control chars)
    │   │
    │   ├── data/                     The Spine (Database)
    │   │   ├── supabase/
    │   │   │   ├── client.ts         Browser Supabase client
    │   │   │   ├── server.ts         Server-side Supabase client
    │   │   │   └── middleware.ts     Auth middleware (session refresh)
    │   │   │
    │   │   ├── actions/              Server Actions ('use server')
    │   │   │   ├── sessions.ts       createSession, saveSession, loadSession, deleteSession
    │   │   │   ├── reflect.ts        The core action: send message → get AI response
    │   │   │   ├── artifacts.ts      generateArtifact, shareArtifact, pinArtifact
    │   │   │   ├── notes.ts          CRUD for notes + channels
    │   │   │   ├── carrying.ts       createCarry, settleCarry, deleteCarry
    │   │   │   └── profile.ts        getProfile, updateSettings, checkSessionCredit
    │   │   │
    │   │   └── queries/              TanStack Query hooks
    │   │       ├── useSessions.ts    Session history queries
    │   │       ├── useArtifacts.ts   Artifact queries (with pinned)
    │   │       ├── useNotes.ts       Notes + channels queries
    │   │       ├── useCarrying.ts    Carrying items queries
    │   │       └── useProfile.ts     Profile + tier queries
    │   │
    │   ├── stores.ts               ★ Zustand stores (session + shell)
    │   │
    │   └── utils/                    Utilities
    │       ├── constants.ts          App-wide constants (storage prefix, limits)
    │       ├── format.ts             Date formatting, text truncation
    │       ├── clipboard.ts          Robust clipboard copy (fallback)
    │       ├── export.ts             Markdown export builder
    │       ├── slugs.ts              nanoid slug generation for sharing
    │       └── rateLimit.ts          Upstash rate limiter config
    │
    └── middleware.ts               Next.js middleware: auth + velvet rope + rate limiting
```

## Architecture Rationale

### Why this structure?

**Three layers, clearly separated:**

- **`src/app/`** — Routing only. Minimal logic. Each page is a thin wrapper that composes components and guards access. Next.js App Router conventions live here and nowhere else.

- **`src/components/`** — The Shell. Pure UI. Organised by domain (layout, sidebar, session, artifact, chat, shared, onboarding). Components receive data via props and stores — they never call Supabase or the AI directly.

- **`src/lib/`** — The Ghost + Spine. All logic. Further split into:
  - `soul/` — The prompt architecture. What makes Sanctum _Sanctum_. Rarely changes.
  - `brain/` — The AI adapter layer. Swappable. Model-agnostic.
  - `data/` — Everything Supabase. Server actions for mutations, TanStack Query hooks for reads.
  - `stores.ts` — Client state. The bridge between Shell and Spine.
  - `utils/` — Pure functions with no dependencies on Supabase, AI, or React.

### Why `(auth)` and `(app)` route groups?

- `(auth)/` routes have no app chrome — no sidebar, no session UI. Just login, callback, and the gate.
- `(app)/` routes share a layout with the `SplitLayout`, auth guard, and sidebar. Every authenticated page inherits this.
- `share/` sits outside both groups — it's public, no auth required, minimal UI.

### Why actions and queries are separate?

- **Actions** (`data/actions/`) are Server Actions with `'use server'`. They mutate data. They run on the server. They handle auth checks, rate limiting, and credit enforcement.
- **Queries** (`data/queries/`) are TanStack Query hooks. They read data. They handle caching, refetching, and optimistic updates on the client.

This keeps the "write path" and "read path" distinct, which matters for optimistic UI — the query cache can be updated immediately while the action runs in the background.

### Why soul/ is separate from brain/?

The Soul (prompts) is the philosophical framework — the four vows, the method examples, the voice definitions. It changes when the _product thinking_ changes.

The Brain (adapters) is the technical plumbing — API calls, streaming, model selection. It changes when the _infrastructure_ changes.

Keeping them separate means you can swap Claude for a fine-tuned model without touching the sovereignty framework, and you can refine the vows without touching the API layer.

## Pre-Built Files (★)

These files are complete and should be dropped into their positions:

| File | Location |
|------|----------|
| `.env.local.example` | Root |
| `tailwind.config.ts` | Root |
| `manifest.json` | `public/` |
| `001_genesis.sql` | `supabase/migrations/` |
| `types.ts` | `src/lib/` |
| `prompts.ts` | `src/lib/soul/` |
| `modes.ts` | `src/lib/soul/` |
| `index.ts` | `src/lib/soul/` |
| `stores.ts` | `src/lib/` |

## Tier System

| Tier | Credits | Reset | Modes | `is_premium` |
|------|---------|-------|-------|-------------|
| Free | 3 (+ share to earn) | One-time | Quick, Standard | `false` |
| Steward | ~30/month | Monthly | Quick, Standard | `true` |
| Founder | ~60/month | Monthly | All + Deep Dive | `true` |

**Model strategy:** All tiers use the same model. Default: Claude Sonnet. Switchable to Haiku or fine-tuned via config. Not a tier differentiator.

**Launch:** Free + Steward only. Founder deferred to post-launch.
