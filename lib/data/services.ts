export type ServiceDetail = {
  name: string;
  slug: string;
  bestFor: string;
  included: string[];
  price: string;
  duration: string;
  prepNotes: string[];
  type: 'makeup' | 'content';
};

export const SERVICES: ServiceDetail[] = [
  {
    name: 'Soft Glam',
    slug: 'soft-glam',
    bestFor: 'A natural, radiant look that enhances your features while keeping your skin looking like skin. Perfect for everyday glam, events, or photos.',
    included: [
      'Skin preparation and priming',
      'Light to medium coverage foundation',
      'Neutral eyeshadow application',
      'Natural lash application',
      'Setting for all-day wear'
    ],
    price: '$120',
    duration: '90 Minutes',
    prepNotes: [
      'Arrive with a clean, moisturized face.',
      'Travel Fee: A $20 travel fee applies for locations beyond a 6-mile radius.'
    ],
    type: 'makeup'
  },
  {
    name: 'Full Glam',
    slug: 'full-glam',
    bestFor: 'A more defined, elevated look with fuller coverage, detailed eye makeup, and a flawless finish. Ideal for special occasions and photoshoots.',
    included: [
      'Detailed skin prep',
      'Full coverage foundation',
      'Contoured and highlighted features',
      'Detailed eye artistry',
      'Premium lash application'
    ],
    price: '$170',
    duration: '120 Minutes',
    prepNotes: [
      'Exfoliate skin the night before.',
      'Travel Fee: A $20 travel fee applies for locations beyond an 8-mile radius.'
    ],
    type: 'makeup'
  },
  {
    name: 'Social Media Video Content (30 Minutes)',
    slug: 'social-media-video-content-30-minutes',
    bestFor: 'Perfect for capturing quick, meaningful moments like birthdays, girls’ dinners, and family content.',
    included: [
      '2 edited videos (1–2 minutes each)',
      'Raw video footage included',
      'Up to 2 revision rounds'
    ],
    price: '$70',
    duration: '30 Minutes',
    prepNotes: [
      'Travel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.'
    ],
    type: 'content'
  },
  {
    name: 'Video Content Session (1 Hour)',
    slug: 'video-content-session-1-hour',
    bestFor: 'Ideal for event coverage and personal branding content with more depth and variety.',
    included: [
      '3 edited videos (1–2 minutes each)',
      'Raw video footage included',
      'Up to 2 revision rounds'
    ],
    price: '$150',
    duration: '1 Hour',
    prepNotes: [
      'Travel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.'
    ],
    type: 'content'
  },
  {
    name: 'Premium Video Content Session (2 Hours)',
    slug: 'premium-video-content-session-2-hours',
    bestFor: 'Best for brands, events, and creators who need a higher volume of content from one session.',
    included: [
      '6 edited videos (1–2 minutes each)',
      'Raw video footage included',
      'Up to 4 revision rounds'
    ],
    price: '$250',
    duration: '2 Hours',
    prepNotes: [
      'Travel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.'
    ],
    type: 'content'
  }
];
