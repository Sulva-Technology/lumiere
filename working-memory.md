# Working Memory

## Problem Summary
- Homepage and footer needed content cleanup based on client feedback, the main nav needed a visible Contact link, and booking service definitions needed to be updated to a new makeup and content-creation offer set.

## Product Goal
- Present a simpler public-facing experience with only the approved homepage sections and the current service lineup.

## Stack and Runtime
- framework: next.js app router
- language: typescript
- ui styling: tailwind css
- backend/runtime: node.js
- database: supabase postgres
- deployment assumptions: vercel preview and production

## Confirmed Facts
- The `Favorite items` block and the closing `Everything points to one of two outcomes...` CTA card were both rendered from `app/home-client.tsx`.
- The first screenshot matched the marketing/CTA area in `components/footer.tsx`, not the hero.
- Main site navigation links are defined in `components/navbar.tsx`.
- Bookable service cards are loaded from Supabase `booking_services` records via `lib/data/public.ts`.
- The repo already had unrelated lint failures in `app/book/page.tsx` and `components/theme-provider.tsx` before this change.

## Unknowns / Needs Confirmation
- Production database state before migration execution is unknown because no local Supabase env credentials were available in the workspace.

## Active Files / Surfaces
- `app/home-client.tsx`
- `app/page.tsx`
- `components/footer.tsx`
- `components/navbar.tsx`
- `supabase/migrations/012_refresh_booking_services.sql`

## Decisions
- Removed the homepage `Favorite items` block and the closing CTA card entirely rather than hiding them behind settings.
- Simplified the footer by removing the descriptive marketing copy and CTA buttons from the left column while keeping branding and link groups intact.
- Added `Contact` to the top navigation link list for both desktop and mobile menus.
- Added a migration that upserts the requested Soft Glam, Full Glam, and three content-creation services, then retires other active makeup/content services.

## API Contracts
- No API shape changes were made. Public booking services still come from `GET /api/booking/services`.

## Data Model
- `booking_services.slug` is unique and is the conflict target used by the new migration.
- Migration `012_refresh_booking_services.sql` updates/inserts approved services and deactivates other active rows by `service_type`.

## Auth and Security
- No auth or security boundary changes were made.

## UI System Notes
- Homepage now ends after the shop section cards.
- Footer keeps branding plus Explore/Information links, without the removed marketing CTA cluster.

## Bugs Fixed
- Removed the client-rejected homepage cards and footer CTA section.
- Added `Contact` to the main nav.
- Prepared the new booking service catalog in Supabase migration form.

## Risks / Watchouts
- The service migration deactivates other active `makeup` and `content` services, which may require admin availability rules to be reassigned if they pointed at retired service rows.
- The migration assumes the requested makeup offer set should be the full active makeup lineup.

## Next Actions
- Run the new Supabase migration in the target environment before expecting the booking page to show the updated services.
- If the client wanted the entire footer brand block removed instead of just the CTA area, do one more small pass on `components/footer.tsx`.

## Latest Implementation Update
- Client feedback in `Itlzlolabeauty.pdf` is implemented in the public site: content-creation UI and public booking access have been removed; Soft Glam and Full Glam are $100 and $150; service-card travel copy is removed; and a $50 same-day option plus configurable travel option are available at checkout.
- Public policy copy now reflects a $35 retainer, 10-minute grace period, $20 late fee, cancellation after 15 minutes, no-show treatment, and photo-use policy context. The artist profile is rewritten with Lola's supplied wording.
- Booking performance: `motion/react` is removed from `app/book/page.tsx`; the initial service and stylist API responses cache for 5 minutes; live availability deliberately remains uncached. The homepage uses 5-minute ISR, and the app-wide ambient background is static CSS rather than JavaScript animation.
- Validation: `npm run lint` passes; the production build compiled successfully.
- Deployment: apply `supabase/migrations/016_makeup_only_services_and_prices.sql`. Content-service records are retired rather than deleted, preserving historical booking/reporting data.
- Open product decision: checkout currently charges the full service price plus selected add-ons. The $35 retainer is presented in site policy and service details; collecting only a retainer requires an explicit payment/accounting workflow change.
