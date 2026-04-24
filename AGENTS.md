# AGENTS.md

## Project Goal

This website is for Itz Lola Beauty. The primary goal is to turn the site into a premium, booking-first beauty service website that increases makeup bookings.

The website should feel luxury, feminine, polished, modern, trustworthy, and mobile-first.

Do not simply make the existing site prettier. Rework the experience around clarity, trust, service comparison, and booking conversion.

## Business Priorities

Primary:
- Increase makeup service bookings.
- Make services, pricing, duration, booking process, and policies clear.

Secondary:
- Support bridal inquiries.
- Support content creation inquiries.
- Support product sales only if products are ready.

Do not let the shop distract from bookings.

## UX Principles

Every visitor should understand within 5 seconds:
- What the business offers.
- Who it is for.
- How to book.
- What services cost.
- How long appointments take.
- Why the artist can be trusted.

Every major section should include a clear booking or inquiry CTA.

## Design Direction

Use:
- Luxury beauty aesthetic.
- Soft neutral palette.
- Elegant accent color.
- Strong whitespace.
- Rounded cards.
- Premium typography hierarchy.
- High-quality image treatment.
- Mobile-first responsive layout.

Avoid:
- Template filler text.
- Placeholder content visible to users.
- Generic copy.
- Clutter.
- Overly strict policy language near the top of the page.
- A store-first layout.

## Homepage Structure

Build the homepage in this order:

1. Header
2. Hero
3. Featured Services
4. Portfolio Preview
5. Why Book With Itz Lola Beauty
6. Booking Process
7. Bridal / Event CTA Banner
8. Testimonials
9. Policies Preview
10. FAQ
11. Contact / Inquiry
12. Footer

## Required Sections

### Header
Include:
- Home
- Services
- Portfolio
- About
- Policies
- Contact
- Book Now

The Book Now button should be visually emphasized and visible on mobile.

### Hero
The hero must communicate a clear service offer.

Suggested headline direction:
“Luxury Glam for Photoshoots, Events, Bridal & Everyday Confidence.”

Include:
- Strong headline
- Clear subheadline
- Primary CTA: Book Your Glam
- Secondary CTA: View Services
- Trust indicators such as Bridal Glam, Event Makeup, Content-Ready Looks

### Services
Replace vague categories with clear service cards.

Each service card must include:
- Service name
- Short description
- Starting price
- Duration
- Best for
- CTA

Suggested services:
- Soft Glam
- Full Glam
- Birthday / Event Glam
- Bridal Preview
- Bridal Wedding Day Makeup
- Bridal Party Makeup
- 1:1 Makeup Lesson
- Content Creation Package

Use editable placeholder values for missing prices/durations, but do not expose unfinished filler text in the UI.

### Portfolio
Create a polished gallery with categories:
- Soft Glam
- Full Glam
- Bridal
- Editorial / Content

If real images are unavailable, create image placeholders with clean visual treatment and internal TODO comments only.

### Booking Process
Use a simple 3-step flow:
1. Choose your service.
2. Pay your deposit to secure your appointment.
3. Arrive ready for your glam experience.

The tone should be warm and professional.

### Policies
Policies should be clear but not intimidating.

Include:
- Deposit policy
- Late policy
- Cancellation policy
- Payment options
- Travel or mobile service policy
- Prep instructions

Do not place strict policy copy before services, portfolio, or trust-building sections.

### Trust
Include:
- Testimonials
- Review cards
- Social proof
- “Trusted for birthdays, bridal, photoshoots, and events”
- FAQ accordion

Use realistic placeholder testimonials only if real testimonials are not available.

### About
Write copy that presents the artist as warm, skilled, reliable, and client-centered.

### Contact / Inquiry
Create a form with:
- Name
- Email
- Phone
- Event date
- Service interested in
- Location
- Message

Support bridal, event, content creation, and general inquiries.

### Shop
If product data exists, show polished product cards.

If products are not ready, hide the shop from the homepage. Never show copy like:
“Feature products in the admin to show them here.”

## Content Rules

Use copy that is:
- Confident
- Warm
- Specific
- Premium
- Beauty-industry appropriate
- Conversion-focused

Avoid vague phrases unless supported by specific services.

## Technical Requirements

- Use semantic HTML.
- Keep components clean and reusable.
- Prioritize mobile responsiveness.
- Add accessible alt text.
- Ensure readable contrast.
- Optimize images.
- Avoid unnecessary dependencies.
- Keep copy easy to update.
- Add TODO comments only in code, never visible in the UI.
- Remove all unfinished template content.
- Do not break existing routes or booking links.
- Preserve any working integrations unless there is a clear reason to refactor them.

## Validation Checklist

Before finishing, verify:
- The site clearly communicates the service offer.
- Booking CTA is visible above the fold on mobile.
- Services are easy to compare.
- Pricing and duration fields exist.
- No placeholder text is visible.
- Policies are clear but not off-putting.
- The site feels premium and trustworthy.
- The mobile experience is excellent.
- Existing functionality still works.