# Boatcrew Compass

A one-page map for how you'll move through the year. Based on Daniel Pink's *2026: Designed* workbook.

## What it does

Two core exercises, digitized and stored in your own Notion workspace:

- **Priorities Compass** — Set your North (long-term projects), South (habits to subtract), East (relationships to invest in), and West (habits to deepen), 3 items each.
- **Quarterly Reflection** — Every 90 days, reflect on what worked, what to subtract, what surprised you, how well you lived your theme, what to adjust, and one action for the next 7 days.

Your data stays in your Notion. Always.

## Tech stack

- Next.js 16 (App Router)
- Notion API via OAuth (public integration)
- Tailwind CSS 4
- Deployed on Vercel

## Setup

### 1. Create a Notion Public Integration

1. Go to https://www.notion.so/profile/integrations
2. Click "New integration", set Type to **Public**
3. Fill in company name, website, privacy policy URL, terms URL
4. Set Redirect URI to `http://localhost:3000/api/auth/notion/callback`
5. Enable: Read content, Update content, Insert content
6. Copy the **OAuth client ID** and **OAuth client secret**

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Notion OAuth credentials:

```
NOTION_OAUTH_CLIENT_ID=your_client_id
NOTION_OAUTH_CLIENT_SECRET=your_client_secret
NOTION_REDIRECT_URI=http://localhost:3000/api/auth/notion/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 4. Deploy to Vercel

1. Push to GitHub
2. Import in Vercel dashboard
3. Set the same env vars (update URLs to production: `https://boatcrew-compass.vercel.app`)
4. Update the Redirect URI in Notion integration settings to match

## Project structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page
│   ├── layout.tsx                      # Root layout
│   ├── globals.css                     # Tailwind import
│   ├── dashboard/page.tsx              # Dashboard (compass summary + reflection status)
│   ├── compass/page.tsx                # Priorities Compass form
│   ├── reflection/page.tsx             # Quarterly Reflection form
│   ├── auth/error/page.tsx             # OAuth error page
│   └── api/
│       ├── auth/notion/route.ts        # Initiate OAuth
│       ├── auth/notion/callback/route.ts # OAuth callback (token exchange)
│       ├── auth/logout/route.ts        # Clear session
│       ├── notion/setup/route.ts       # Create databases on first login
│       ├── compass/route.ts            # GET/POST compass priorities
│       └── reflection/route.ts         # GET/POST quarterly reflections
├── lib/
│   ├── notion.ts                       # Notion client helper + auth
│   └── notion-schemas.ts              # Database schemas + types
└── middleware.ts                       # Route protection
```

## Future roadmap

- AI agents (Cheerleader, Coach, Challenger) via Supabase
- Daily journaling with Whisper.ai
- Deep research agent for personalized learning paths
