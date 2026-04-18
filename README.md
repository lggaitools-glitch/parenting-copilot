# Parenting Copilot

Sleep-first parenting app built with Next.js, ready for Vercel + Supabase.

## What this version includes
- mobile-first onboarding
- baby sleep coach chat UI
- Supabase-ready auth gate (magic link)
- Supabase persistence for baby profile, sleep logs, and chat messages
- local fallback mode when Supabase env vars are missing
- server route scaffold for future real LLM responses

## Required env vars
Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Local development
```bash
npm install
npm run dev
```

Open `http://localhost:3000`

## Supabase setup
1. Create a new Supabase project.
2. In Supabase SQL editor, run `supabase-schema.sql`.
3. In Supabase Auth settings:
   - enable Email auth
   - enable magic links / OTP
4. Add your local dev URL and future Vercel URL to allowed redirects.
5. Copy project URL and anon key into `.env.local`.

## Vercel deploy
1. Push this app to GitHub.
2. Import the repo in Vercel.
3. Add these env vars in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy.
5. Add the deployed Vercel URL to Supabase Auth redirect URLs.
6. Test magic-link sign-in from phone and desktop.

## Current architecture note
The chat API currently uses deterministic seeded coaching responses through `/api/chat`.
That is deliberate for now so the app works without an AI secret.

Next production step:
- connect `/api/chat` to OpenAI or Anthropic
- store conversation summaries
- generate structured nightly plans

## Checks
```bash
npm run lint
npm run build
```
