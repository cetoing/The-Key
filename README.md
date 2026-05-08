# The Key

The Key is a dissertation prototype for an AI-supported internship platform for UK university students, with accessibility and neurodiverse support built into the main user journey.

Copyright © 2026 Cetin Aksoy. All rights reserved.

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Supabase / Bolt PostgreSQL
- OpenAI API
- Recharts

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Fill in the required environment variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_server_only_service_role_or_secret_key_here
```

4. Run the development server:

```bash
npm run dev
```

## Checks

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Security Notes

- Do not commit `.env` or real API keys.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Public Supabase access should rely on Row Level Security policies.
- AI routes require an authenticated Supabase session.

## Ownership and Usage

This repository contains a final-year Computer Science dissertation project created and owned solely by Cetin Aksoy.

This project is proprietary and is not open source. No part of this project may be copied, modified, distributed, sublicensed, submitted as another person's academic work, or used commercially without explicit written permission from the owner.

Third-party dependencies and generated UI primitives remain subject to their own permissive licences and notices. Those notices do not grant any rights to reuse this proprietary project as a whole.
