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

## Latest Client Review Follow-Up
- Removed the entire homepage `Your Glam Experience` section, matching the client’s item 2 request. The standalone makeup service card is now a full-width, intentionally composed feature rather than an empty two-column grid.
- Added explicit loading states for initial Supabase service/stylist data and live availability in `app/book/page.tsx`. The initial service request now runs once rather than once per selected-stylist update.
- Updated the homepage Terms link to `/terms-of-service`, created the requested visible policy content there, and restored a Terms & Conditions footer link.
- Validation: lint passes and the production build compiled successfully after these follow-up changes.

## Gallery & Homepage Controls
- The redundant homepage Services panel was replaced with an editorial, image-led portfolio gallery. It uses the first five active images, with the lead image given dominant visual weight and supporting images arranged as a responsive collage.
- New protected admin route: `/admin/gallery`. Managers can upload an image, add title/category/accessible alt text, set display order, hide/show an image, edit, or remove it. Uploads reuse the existing Supabase Storage bucket and media-asset tracking model.
- New Settings > Homepage Sections controls independently show/hide Hero image, Portfolio gallery, Booking policies, and Common questions. Each individual gallery item also has its own Live toggle.
- New migration: `017_home_gallery_and_section_visibility.sql` creates `gallery_items`, adds section visibility settings, and seeds the existing visual assets only if the gallery is empty.
- Homepage gracefully displays an attractive local fallback gallery until migration 017 has been applied; the full editable admin gallery needs that migration in Supabase.
- Validation: `npm run lint` passes and the production build completed successfully.
