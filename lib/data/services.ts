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
    price: '$100',
    duration: '90 Minutes',
    prepNotes: ['Arrive with a clean, moisturized face.'],
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
    price: '$150',
    duration: '120 Minutes',
    prepNotes: ['Exfoliate skin the night before.'],
    type: 'makeup'
  },
];
