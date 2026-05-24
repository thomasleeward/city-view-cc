# City View Community Church

Modern rebuild of https://cityviewcc.com using Next.js App Router, TypeScript, Tailwind CSS, Supabase, GitHub, and Vercel.

## Project Structure

- `src/app/(site)` public website routes
- `src/app/admin` Supabase-auth protected admin routes
- `src/components/site` public reusable sections and cards
- `src/components/admin` admin shell, nav, and upload controls
- `src/components/ui` shared primitives
- `src/lib/content` migrated fallback content and placeholder copy
- `src/lib/supabase` Supabase clients, auth helpers, query helpers, and types
- `supabase/schema.sql` initial database, RLS, and storage policies
- `docs/content-migration-audit.md` current-site sitemap/content audit

## Local Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The public site renders with fallback content before Supabase is configured. Admin routes require Supabase env vars and an admin user.

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_EVENTS_URL=
NEXT_PUBLIC_GIVING_URL=https://app.securegive.com/cityviewcc
NEXT_PUBLIC_PRAYER_FORM_URL=
NEXT_PUBLIC_CONTACT_FORM_URL=
NEXT_PUBLIC_CONNECT_FORM_URL=
```

Planning Center TODOs are intentionally isolated behind these URL placeholders until API access is available.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Optional but recommended: run `supabase/seed-sermon-series.sql` to import the current sermon archive from the old website.
4. Confirm storage buckets exist:
   - `sermon-images`
   - `hero-images`
   - `site-images`
5. Create the first admin user in Supabase Auth.
6. Confirm the `profiles` row for that user has `role = 'admin'`.
7. Add env vars to `.env.local`.
8. Visit `/admin/login`.

Current admin features:

- Add sermon series with name, date label, dates, image URL/upload, and YouTube playlist URL.
- List sermon series newest first.
- Add homepage hero slides with headline, subheadline, image URL/upload, CTA fields, active state, and future video URL support.

## Vercel Deployment

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy.
5. Point DNS to Vercel when ready to launch.

## Content Migration Checklist

- Copy final homepage hero imagery into Supabase Storage.
- Import all sermon archive series from `/watch`.
- Upload sermon series images to `sermon-images`.
- Upload reusable site photos to `site-images`.
- Copy the full About Us Statement of Faith.
- Confirm team names, titles, emails, and photos.
- Replace contact and prayer placeholders with Planning Center form URLs.
- Replace Events placeholder with Church Center / Planning Center URL.
- Confirm whether Giving remains SecureGive or moves to another provider.
- Add Planning Center API integration later once credentials and API scope are known.
