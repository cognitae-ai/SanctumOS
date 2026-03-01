# SanctumOS Setup: API Keys

You need to fill in 3 values in your `.env.local` file to make the app work.

**File Location:** `F:\SanctumOS - Local\.env.local`

---

### 1. Supabase (Database & Auth)

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard/projects).
2.  Select your **SanctumOS** project.
3.  Go to **Settings** (gear icon) → **API**.
4.  Copy the **Project URL**.
    *   Paste it into `.env.local` next to `NEXT_PUBLIC_SUPABASE_URL=`
5.  Copy the **`anon` public** key.
    *   Paste it into `.env.local` next to `NEXT_PUBLIC_SUPABASE_ANON_KEY=`

> **Note:** You can ignore `SUPABASE_SERVICE_ROLE_KEY` for now, the app doesn't use it on the client side.

---

### 2. Anthropic (The Ghost)

1.  Log in to the [Anthropic Console](https://console.anthropic.com/settings/keys).
2.  Click **Get API Keys**.
3.  Create a new key (e.g., "Sanctum Local").
4.  Copy the key (starts with `sk-ant-...`).
5.  Paste it into `.env.local` next to `ANTHROPIC_API_KEY=`

---

### 3. Save & Launch

1.  **Save** the `.env.local` file in your editor.
2.  Run **`start_sanctum.bat`** again.
