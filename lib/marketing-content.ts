export type MarketingFaqItem = {
  question: string;
  answer: string;
};

export type MarketingPolicyItem = {
  title: string;
  summary: string;
};

export type PortfolioCategory = {
  title: string;
  description: string;
  imageSrc: string;
  alt: string;
};

export const inquiryServiceOptions = [
  'Soft Glam',
  'Full Glam',
  'Birthday / Event Glam',
  'Bridal Preview',
  'Bridal Wedding Day Makeup',
  'Bridal Party Makeup',
  '1:1 Makeup Lesson',
  'Content Creation Package',
  'General Inquiry',
] as const;

export const trustReasons = [
  {
    title: 'Luxury artistry with a soft, client-first touch',
    description:
      'Every appointment is shaped around your features, your comfort, and the finish you want in person and on camera.',
  },
  {
    title: 'Clear service options before you book',
    description:
      'You can compare services, starting rates, timing, and what each appointment is best for before you commit.',
  },
  {
    title: 'Trusted for birthdays, bridal, photoshoots, and events',
    description:
      'From intimate glam to milestone moments, the experience is polished, dependable, and designed to photograph beautifully.',
  },
] as const;

export const bookingSteps = [
  {
    title: 'Choose your service',
    description: 'Select the glam experience that matches your event, desired finish, and schedule.',
  },
  {
    title: 'Pay your deposit',
    description: 'Secure your appointment through the existing booking flow and receive your confirmation details.',
  },
  {
    title: 'Arrive ready for glam',
    description: 'Come prepped, relaxed, and ready for a polished, luxury beauty experience tailored to you.',
  },
] as const;

export const portfolioCategories: PortfolioCategory[] = [
  {
    title: 'Soft Glam',
    description: 'Radiant skin, softly sculpted eyes, and polished beauty for birthdays, portraits, and special plans.',
    imageSrc: '/images/makeup.jpeg',
    alt: 'Soft glam makeup close-up with radiant skin and softly defined eyes.',
  },
  {
    title: 'Full Glam',
    description: 'Elevated coverage, stronger definition, and statement glam that still feels refined and wearable.',
    imageSrc: '/images/home.jpeg',
    alt: 'Full glam makeup portrait with a polished event-ready finish.',
  },
  {
    title: 'Bridal',
    description: 'Camera-ready glam designed to last through wedding mornings, ceremonies, and every photographed moment.',
    imageSrc: '/images/founder.jpeg',
    alt: 'Bridal-inspired beauty portrait with elegant, polished makeup.',
  },
  {
    title: 'Editorial / Content',
    description: 'Beauty and content support for creators, branding sessions, and elevated digital storytelling.',
    imageSrc: '/images/content_studio.png',
    alt: 'Beauty content creation setup with a polished studio atmosphere.',
  },
] as const;

export const testimonials = [
  {
    quote:
      'My glam looked flawless in person and even better in photos. The whole appointment felt calm, polished, and worth every minute.',
    name: 'Arielle M.',
    context: 'Birthday glam client',
  },
  {
    quote:
      'I loved how clear the booking process was. I knew exactly what I was booking, what it would cost, and how to prepare.',
    name: 'Nicole T.',
    context: 'Event makeup client',
  },
  {
    quote:
      'Professional, warm, and reliable from inquiry to final look. I felt taken care of the entire time.',
    name: 'Danielle R.',
    context: 'Bridal inquiry client',
  },
] as const;

export const policyPreviewItems: MarketingPolicyItem[] = [
  {
    title: 'Deposit policy',
    summary: 'Appointments are secured with a non-refundable deposit that goes toward your service total.',
  },
  {
    title: 'Late arrivals',
    summary: 'Please arrive on time so your full service window can be honored and the schedule stays smooth for every client.',
  },
  {
    title: 'Cancellations',
    summary: 'Schedule changes should be made as early as possible to protect your deposit and allow waitlisted clients to book.',
  },
  {
    title: 'Payment options',
    summary: 'Secure online checkout is available, and any remaining balance is discussed clearly before your appointment date.',
  },
  {
    title: 'Travel / mobile services',
    summary: 'Travel requests are welcome when available, with any applicable travel fees shared before confirmation.',
  },
  {
    title: 'Prep instructions',
    summary: 'Arrive with a clean, moisturized face and share inspiration early so the appointment starts smoothly.',
  },
] as const;

export const policyPageSections = [
  {
    title: 'Deposits & securing your appointment',
    body: [
      'A deposit is required to reserve your date and time. This deposit is applied toward your booked service.',
      'Appointments are only confirmed after the deposit has been completed through the approved booking or inquiry process.',
    ],
  },
  {
    title: 'Late arrivals',
    body: [
      'Please arrive on time so your appointment can begin as scheduled and your full glam experience can be delivered properly.',
      'Late arrival may shorten the service window or require rescheduling when timing no longer allows the booked service to be completed well.',
    ],
  },
  {
    title: 'Cancellations & rescheduling',
    body: [
      'If you need to reschedule, reach out as early as possible. Advance notice helps protect your deposit and allows schedule adjustments when available.',
      'Last-minute cancellations may lead to deposit forfeiture, especially for premium or high-demand booking windows.',
    ],
  },
  {
    title: 'Payments',
    body: [
      'Service pricing is shared clearly before confirmation. Any remaining balance is discussed before the appointment date so there are no surprises.',
      'Approved payment methods are communicated during booking or inquiry confirmation.',
    ],
  },
  {
    title: 'Travel & on-location glam',
    body: [
      'Travel or mobile appointments are offered based on availability. Location, start time, and readiness requirements should be shared during inquiry.',
      'Any travel fee is confirmed before the booking is finalized.',
    ],
  },
  {
    title: 'Client prep',
    body: [
      'Please arrive with a clean face unless different prep is requested for your service.',
      'Share inspiration photos, skin concerns, timing needs, and special event details in advance so your appointment can be tailored properly.',
    ],
  },
] as const;

export const faqItems: MarketingFaqItem[] = [
  {
    question: 'How do I book an appointment?',
    answer:
      'Use the booking page to select an available service and time, then complete the secure checkout flow to reserve your appointment.',
  },
  {
    question: 'Do you offer bridal and event bookings?',
    answer:
      'Yes. Bridal, wedding-day, and special-event glam are supported through inquiry so timing, location, and party size can be confirmed properly.',
  },
  {
    question: 'Are lashes included?',
    answer:
      'Lash preferences are collected during the booking flow for makeup services so the appointment can be tailored to your desired finish.',
  },
  {
    question: 'Can I book content creation support too?',
    answer:
      'Yes. Content-focused services are available for creators, branding sessions, and polished digital storytelling needs.',
  },
  {
    question: 'What should I do before my appointment?',
    answer:
      'Arrive on time with a clean, moisturized face, and send inspiration details early if you have a specific look, mood, or event in mind.',
  },
  {
    question: 'What if I need to reschedule?',
    answer:
      'Reach out as early as possible so the appointment can be adjusted if availability allows and your deposit terms can be reviewed clearly.',
  },
] as const;
