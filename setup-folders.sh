#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SanctumOS v1.0.0 — Folder Structure Generator
# Run this once to create the entire project skeleton.
# Then drop in the pre-built files (★) and let the IDE work.
# ═══════════════════════════════════════════════════════════════

echo "Creating SanctumOS folder structure..."

# Root config (IDE generates these, but create dirs)
mkdir -p .husky

# Documentation
mkdir -p docs

# Public assets
mkdir -p public

# Supabase
mkdir -p supabase/migrations

# App Router — routing
mkdir -p src/app/'(auth)'/login
mkdir -p src/app/'(auth)'/callback
mkdir -p src/app/'(auth)'/gate
mkdir -p src/app/'(app)'/session/'[id]'
mkdir -p src/app/'(app)'/settings
mkdir -p src/app/share/'[slug]'
mkdir -p src/app/api/health

# Components — The Shell
mkdir -p src/components/layout
mkdir -p src/components/sidebar
mkdir -p src/components/session
mkdir -p src/components/artifact
mkdir -p src/components/chat
mkdir -p src/components/shared
mkdir -p src/components/onboarding

# Lib — The Ghost + Spine
mkdir -p src/lib/soul
mkdir -p src/lib/brain
mkdir -p src/lib/data/supabase
mkdir -p src/lib/data/actions
mkdir -p src/lib/data/queries
mkdir -p src/lib/utils

echo ""
echo "✓ Folder structure created."
echo ""
echo "Next steps:"
echo "  1. Drop pre-built files (★) into their positions"
echo "  2. Run: pnpm create next-app . --typescript --tailwind --eslint --app --src-dir"
echo "  3. Let the IDE agent begin Phase 0"
echo ""
echo "Pre-built files to place:"
echo "  .env.local.example          → root"
echo "  tailwind.config.ts          → root"
echo "  manifest.json               → public/"
echo "  001_genesis.sql             → supabase/migrations/"
echo "  types.ts                    → src/lib/"
echo "  prompts.ts                  → src/lib/soul/"
echo "  modes.ts                    → src/lib/soul/"
echo "  index.ts                    → src/lib/soul/"
echo "  stores.ts                   → src/lib/"
