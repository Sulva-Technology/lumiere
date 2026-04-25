# Working Memory

## Problem Summary
- Public-facing pages needed to be rebuilt around a premium, booking-first beauty experience with clearer service comparison, stronger trust-building, polished inquiry handling, and mobile-visible conversion paths.

## Product Goal
- Turn the site into a luxury, feminine, booking-first beauty website that increases makeup bookings while still supporting bridal and content inquiries.

## Stack and Runtime
- framework: next.js app router
- language: typescript
- ui styling: tailwind css
- backend/runtime: node.js
- database: supabase postgres
- deployment assumptions: vercel preview and production

## Confirmed Facts
- The homepage route remains `app/page.tsx` with the public experience rendered by `app/home-client.tsx`.
- Live bookable services still come from Supabase `booking_services` via `lib/data/public.ts`.
- Shop routes and cart integrations remain intact, but homepage emphasis was shifted away from shop-first merchandising.
- General inquiries now submit through `POST /api/contact`, validated by Zod and delivered through the existing Resend mailer setup in `lib/notifications.ts`.
- Desktop and mobile navigation now emphasize Home, Services, Portfolio, About, Policies, Contact, and Book Now.
- Full repo lint is currently green after cleaning prior issues in `app/book/page.tsx` and `components/theme-provider.tsx`.

## Unknowns / Needs Confirmation
- Production Supabase content for bridal-specific services is still unknown; homepage bridal cards use polished inquiry-first fallbacks rather than assuming live booking records exist.

## Active Files / Surfaces
- `app/home-client.tsx`
- `app/page.tsx`
- `app/layout.tsx`
- `app/about/page.tsx`
- `app/contact/page.tsx`
- `app/faq/page.tsx`
- `app/policies/page.tsx`
- `app/api/contact/route.ts`
- `components/contact-inquiry-form.tsx`
- `components/faq-accordion.tsx`
- `components/footer.tsx`
- `components/navbar.tsx`
- `components/theme-provider.tsx`
- `lib/marketing-content.ts`
- `lib/notifications.ts`
- `lib/schemas.ts`
- `app/sitemap.ts`

## Decisions
- Rebuilt the homepage into the AGENTS.md section order: hero, featured services, portfolio, trust, process, bridal CTA, testimonials, policies preview, FAQ, contact, footer.
- Preserved the existing `/book` booking flow and live service API as the primary conversion path for standard bookable services.
- Routed bridal and custom services toward inquiry-first CTAs instead of inventing unsupported booking records.
- Added a dedicated `/policies` route and refreshed `/faq`, `/contact`, and `/about` to match the booking-first public narrative.
- Added a reusable inquiry form component and a lightweight `POST /api/contact` route rather than introducing a new external form provider.

## API Contracts
- Existing booking contracts remain unchanged: public booking services still come from `GET /api/booking/services`, and booking checkout still flows through `POST /api/bookings`.
- New public inquiry contract: `POST /api/contact` accepts `fullName`, `email`, `phone`, `eventDate`, `serviceInterest`, `location`, and `message`.

## Data Model
- `booking_services.slug` is unique and is the conflict target used by the new migration.
- Homepage service comparison now blends live `booking_services` pricing where available with curated inquiry-first service definitions for unsupported bridal/lesson offerings.

## Auth and Security
- Public inquiry submissions use the same trusted-origin checks and rate limiting pattern as the other public POST routes.

## UI System Notes
- The public-facing design now leans into warm editorial luxury: full-bleed hero, serif-led hierarchy, soft neutrals, gold accents, and restrained glass/surface treatments.
- Homepage sections use anchor IDs for Services, Portfolio, Policies, FAQ, and Contact to support the revised navigation.
- The mobile header now keeps `Book Now` visible.
- Theme tokens in `app/globals.css` now register surface, border, input, text-accent, and soft-shadow utilities with Tailwind so light/dark surfaces do not silently lose backgrounds, borders, or shadows.
- Form fields and FAQ panels now use shared theme tokens instead of hard-coded light surfaces, and the homepage hero-top nav controls use explicit white text/darker glass for contrast over the image.

## Bugs Fixed
- Removed the shop-first homepage structure in favor of a booking-first conversion flow.
- Added real inquiry form submission instead of a purely presentational contact form.
- Cleared the previous repo-wide lint failures in `app/book/page.tsx` and `components/theme-provider.tsx`.
- Fixed light/dark theme contrast regressions caused by missing Tailwind token registrations and light-only component overrides.

## Risks / Watchouts
- Bridal preview, bridal party, wedding-day makeup, and lessons are currently marketed through inquiry-first cards unless matching live booking services are later added to Supabase.
- The homepage no longer surfaces shop content, so if products become a business priority later, that should be a deliberate secondary pass instead of restoring the previous home layout.

## Next Actions
- Review the live content and contact addresses in admin `store_settings` so the inquiry flow replies route to the right inboxes in production.
- If bridal or lesson services should become directly bookable, add those records to `booking_services` and availability instead of relying on inquiry-only fallbacks.
