# Working Memory

## Problem summary

Clients could navigate the booking calendar to later months but saw no recurring availability.

## Confirmed facts

- Recurring slots are materialized by `syncRecurringAvailabilityRules` for a 13-week horizon.
- The public availability flow had stopped calling that sync after a previous timeout workaround.
- The sync previously processed every stylist and active service, making it unsuitable to restore unscoped on the public request path.

## Decision

- Restore the public refresh, scoped to the selected stylist and service.
- Keep admin-triggered refreshes unscoped so schedule edits continue to rebuild the whole schedule.

## Touched files

- `lib/data/availability.ts`
- `lib/data/public.ts`

## Verification

- `npm run lint` passes with no warnings.
- `npm run build` passes.
