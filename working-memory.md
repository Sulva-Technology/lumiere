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

## Follow-up simplification

- Production has finite manually-created slots for Damilola but no recurring rule to extend them into later months.
- When no active recurring rule exists, availability now derives a weekly template from those real slots and extends it through the rolling calendar window.
- Bookings and payment holds now block only overlapping appointment time, rather than applying hidden multi-hour buffers.
