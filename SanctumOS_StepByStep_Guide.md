# SanctumOS — Your Step-by-Step Guide

> Everything from here to launch. Read this start to finish.
> Come back to it whenever you need to re-orient.

---

## Where We Are Right Now

You have a working prototype (`sanctum-v9.5.jsx`) that runs entirely in the browser. It proves the concept works — the sovereignty framework, the triadic method, the session flow, the artifact generation, the notes system, the sidebar. All of it works.

What you're doing on Friday is taking that prototype and rebuilding it as a real application — one with user accounts, a database, proper security, and a path to revenue. The thinking is done. The build is assembly.

**You have 12 files ready to go:**

| File | What it is |
|------|-----------|
| `SanctumOS_Production_v1.0.md` | The master prompt that tells Gemini what to build |
| `sanctum-v9.5.jsx` | The prototype — Gemini's primary reference for everything |
| `setup-folders.sh` | Creates every folder in one command |
| `ARCHITECTURE.md` | Folder structure with rationale |
| `001_genesis.sql` | Database: 6 tables, security policies, helper functions |
| `types.ts` | Every TypeScript type in the system |
| `prompts.ts` | The Soul — sovereignty frame, four vows, method examples, voice config, safety |
| `modes.ts` | Session modes, triadic config, phase logic |
| `soul/index.ts` | Prompt assembly functions |
| `stores.ts` | Two Zustand state stores |
| `tailwind.config.ts` | Exact color map, animations, typography |
| `.env.local.example` | Every environment variable documented |
| `manifest.json` | PWA configuration |

---

## Before Friday — Your Prep Checklist

Do all of this before you open the IDE. Having these ready means Gemini can build without waiting for you to go set things up mid-session.

### Accounts to Create

**1. GitHub**
- Create a private repository called `sanctumos`
- Don't push anything to it yet
- This is where your code will live

**2. Supabase**
- Go to supabase.com, create an account
- Create a new project
- **Region:** Choose London (`eu-west-2`) or nearest to you
- **Important:** Write down your project password somewhere safe
- Once created, go to Settings → API and note down:
  - Project URL (`https://your-project.supabase.co`)
  - `anon` public key
  - `service_role` secret key (keep this safe — it bypasses security)
- Go to Settings → Database → Enable Point-in-Time Recovery if available on your plan

**3. Anthropic**
- Go to console.anthropic.com
- Create an API key
- **Important:** Go to Settings → Limits and set a hard monthly cap of $50
- This prevents a bug or spike from running up a bill
- Note down your API key (`sk-ant-...`)

**4. Resend**
- Go to resend.com, create an account
- This handles the "magic link" login emails
- You'll need to verify a domain eventually, but for testing the default works
- Note down your API key

**5. Upstash**
- Go to console.upstash.com
- Create a Redis database (free tier is fine)
- This handles rate limiting — stops anyone from hammering your AI
- Note down the REST URL and REST token

**6. Vercel**
- Go to vercel.com, connect your GitHub account
- Don't deploy anything yet — just have the account ready
- When you eventually import your repo, Vercel auto-deploys on push

### Domain (Optional but recommended)

If you have a domain (e.g. `sanctumos.co` or similar), point it at Vercel when you're ready. Not urgent for alpha.

### Fill In Your Keys

Once you have all the accounts, create a file called `.env.local` (not the example — your actual one) with all the real values filled in. Keep this file on your local machine only, never commit it to GitHub.

---

## Friday — The Build Session

### Step 1: Set Up Your Workspace

Open your project directory (wherever you want `sanctumos` to live on your machine).

Run the `setup-folders.sh` script. This creates every folder and subfolder in the correct structure. You should see something like 25+ directories created.

### Step 2: Place the Pre-Built Files

Drop each file into its position:

```
.env.local.example          → root (next to setup-folders.sh)
tailwind.config.ts          → root
manifest.json               → public/
001_genesis.sql             → supabase/migrations/
types.ts                    → src/lib/
prompts.ts                  → src/lib/soul/
modes.ts                    → src/lib/soul/
index.ts                    → src/lib/soul/
stores.ts                   → src/lib/
```

Also place your actual `.env.local` (with real keys) in the root.

### Step 3: Open Gemini in Anti Gravity

Feed it these files in this order:

1. **`SanctumOS_Production_v1.0.md`** — the master prompt. This tells Gemini what the whole project is.
2. **`sanctum-v9.5.jsx`** — the prototype. This is the reference for how everything should look and behave.
3. **Your persona file** if you have one.

### Step 4: The Opening Instruction

Tell Gemini:

> "Read the production specification and the prototype in full. These are the blueprint for SanctumOS v1.0.0. Nine files are already built and placed in the project — types, prompts, modes, soul/index, stores, tailwind config, SQL migration, env example, and manifest. Do not regenerate these. Build everything else around them. Start with the Architecture Review from Part 7, then wait for approval before writing any code."

This forces Gemini to read everything, acknowledge what exists, and go through the validation step before touching code.

### Step 5: Approve the Blueprint

Gemini should come back with:
- A risk assessment (3 risks with mitigations)
- An optimization proposal
- A confirmed execution plan

Read these. If anything seems off, push back. When you're satisfied:

> "The Blueprint is approved. Begin Phase 0."

### Step 6: Let It Build — Phase by Phase

The production prompt has built-in checkpoints. Gemini should pause after:

- **Phase 0:** Infrastructure manifest → you confirm
- **Phase 1, Step 2:** Folder structure proposal → you confirm (should match what we've already set up)
- **After each Phase:** Chronicle entry → you verify it makes sense

**If Gemini tries to skip ahead or combine phases, stop it.** Each phase has dependencies. The schema must exist before the server actions. The server actions must exist before the UI wires to them.

### Step 7: The Critical Moments

These are where things are most likely to go wrong:

**When Gemini builds the AI adapter (`src/lib/brain/`):**
- Make sure it imports from our `soul/` files, not from some invented prompt
- The `buildSystemPrompt()` function in `soul/index.ts` is the source of truth
- It should NOT hardcode model names — use an environment variable or config

**When Gemini builds the database client (`src/lib/data/supabase/`):**
- The service role key must NEVER appear in any client component
- All Supabase admin operations go through server actions only
- Check that it's using the `@supabase/ssr` package, not the old `@supabase/auth-helpers`

**When Gemini builds the UI components:**
- It should reference the prototype constantly — colors, spacing, typography, animation timing
- If something looks different from the prototype, that's a bug
- The split-panel layout, sidebar toggle, note cards, session cards — all of this exists in v9.5 and should be ported faithfully

**When Gemini builds the share route (`/share/[slug]`):**
- This is a public route — no auth required
- It should only show the artifact, nothing else
- The OG image generation uses `next/og`

### Step 8: Testing

Once the build reaches a deployable state:

1. **Auth flow:** Can you sign up, get a magic link, log in?
2. **Session flow:** Can you start a session, go through all exchanges, get an artifact?
3. **Notes:** Can you add, edit, delete, pin notes? Do channels work?
4. **Carrying:** Do questions appear from sessions? Can you settle them?
5. **Session credits:** Do they decrement? Does sharing earn one back?
6. **Velvet rope:** Does the password gate work when `APP_PHASE=alpha`?
7. **Mobile:** Does the tab system work? Does everything fit?

### Step 9: Deploy

- Push to GitHub
- Import the repo in Vercel
- Add all your environment variables in Vercel's dashboard
- Deploy
- Test the live URL

---

## After Launch — Coming Back to Me

When you hit problems or need decisions, come back here. I have the full context — the prototype, the prompt architecture, the schema, the design rationale. Things you'll likely need help with:

- **Prompt tuning:** If the AI responses drift or feel off, we adjust SKELETON/ORGANS/MUSCLES/SKIN
- **Schema changes:** If you need new tables or columns, I'll write the migration
- **Feature design:** Notes v2, Deep Dive mode, any new session types
- **Fine-tuning prep:** When you're ready to train a model, we'll prepare the dataset from your session logs
- **Debugging:** If Gemini produces something that doesn't work, bring me the error and the file

---

## Key Decisions — For Reference

These are finalised. Don't let Gemini re-decide them.

**Tiers:**
| Tier | Credits | Modes | Available |
|------|---------|-------|-----------|
| Free | 3 (one-time + share to earn) | Quick, Standard | Launch |
| Steward | ~30/month (monthly reset) | Quick, Standard | Launch |
| Founder | ~60/month (monthly reset) | All + Deep Dive | Post-launch |

**Model strategy:** All tiers use the same model. Prompt architecture does the heavy lifting, not model selection. Default Claude Sonnet. Switchable to Haiku or fine-tuned via config. Not a tier differentiator.

**What's in scope for alpha:**
- Auth (magic link)
- Full session flow (Quick Check + Standard)
- Artifact generation and display
- Notes with channels, pinning, export
- Carrying lifecycle (from artifacts, settle on your terms)
- Shift log
- Share-to-earn (public artifact routes)
- Session credit gating
- Velvet rope (password gate for alpha access)
- Mobile tab system
- Print/export/copy

**What's deferred:**
- Deep Dive mode (founder-only, post-launch)
- Stripe payments (manual tier assignment for alpha)
- PostHog analytics (Vercel Analytics covers alpha)
- Swipe gestures on mobile (tabs for now)
- Fine-tuned model integration
- Cross-session awareness (session digest exists but no retrieval yet)

---

## The Philosophy — Don't Lose This

The product works because of the sovereignty framework. Every design decision flows from it. When in doubt, ask: does this respect the person's authority over their own experience?

The four vows are not prompting tricks. They are the mechanism by which reflection actually works. If someone suggests "improving" the prompts by adding validation, encouragement, or interpretation — that breaks the product. The vows are non-negotiable.

The triadic method (episteme, techne, phronesis) gives structure without prescription. It ensures every session covers what's true, what's possible, and what matters — in that order, deliberately. It's not a gimmick. It's the architecture of good thinking.

The artifacts belong to the person. Their words, arranged for clarity, returned to them. Not the AI's interpretation. Not a summary. A mirror.

Everything you've built serves these principles. Don't let the build process dilute them.

---

*You built this. The thinking is yours. The framework is ours. Friday is just giving it a proper home.*
