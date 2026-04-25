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
    bestFor: 'Daily confidence, brunch, casual photoshoots, or anyone wanting a natural, polished enhancement.',
    included: [
      'Skin preparation and priming',
      'Light to medium coverage foundation',
      'Neutral eyeshadow application',
      'Natural lash application',
      'Lip color and setting spray'
    ],
    price: '$120',
    duration: '90 Minutes',
    prepNotes: [
      'Arrive with a clean, moisturized face.',
      'Groom eyebrows 24-48 hours before the appointment.',
      'Bring your favorite lip product if you wish to touch up later.'
    ],
    type: 'makeup'
  },
  {
    name: 'Full Glam',
    slug: 'full-glam',
    bestFor: 'Birthdays, red carpet events, night-out celebrations, and professional photography.',
    included: [
      'Detailed skin prep and hydration',
      'Full coverage, long-wear foundation',
      'Contour and highlight for camera depth',
      'Dramatic or detailed eye makeup',
      'Premium lash application'
    ],
    price: '$170',
    duration: '120 Minutes',
    prepNotes: [
      'Exfoliate and hydrate skin the night before.',
      'Ensure any facial hair or peach fuzz is groomed as desired.',
      'Provide inspiration photos for the specific "look" you want.'
    ],
    type: 'makeup'
  },
  {
    name: 'Birthday / Event Glam',
    slug: 'birthday-event-glam',
    bestFor: 'Special celebrations where you want to stand out and feel your best.',
    included: [
      'Long-lasting makeup application tailored to your event lighting',
      'Custom lash fitting',
      'Touch-up kit for the event',
      'Waterproof setting'
    ],
    price: 'Starting at $150',
    duration: '90 - 105 Minutes',
    prepNotes: [
      'Coordinate your makeup with your outfit color and style.',
      'Clean skin is essential for longevity.'
    ],
    type: 'makeup'
  },
  {
    name: 'Bridal Preview',
    slug: 'bridal-preview',
    bestFor: 'Brides-to-be wanting to test their wedding day look and ensure perfect products for their skin.',
    included: [
      'In-depth consultation on wedding theme and style',
      'Trial of full wedding day makeup',
      'Skin analysis and product recommendations',
      'Timing and logistics planning'
    ],
    price: '$150',
    duration: '120 Minutes',
    prepNotes: [
      'Wear a white or light-colored top to see how the makeup interacts with bridal colors.',
      'Bring photos of your dress, hair, and jewelry.'
    ],
    type: 'makeup'
  },
  {
    name: 'Bridal Wedding Day Makeup',
    slug: 'bridal-wedding-day',
    bestFor: 'The bride on her big day for a timeless, photogenic, and high-end finish.',
    included: [
      'Premium skin prep and luxury products',
      'Customized long-wear artistry',
      'Décolletage and body glow',
      'Luxury lash application',
      'Full-size touch-up kit'
    ],
    price: '$250',
    duration: '120 Minutes',
    prepNotes: [
      'Follow the pre-wedding skin routine discussed during the preview.',
      'Allow ample time in the bridal suite for a relaxed experience.'
    ],
    type: 'makeup'
  },
  {
    name: 'Bridal Party Makeup',
    slug: 'bridal-party',
    bestFor: 'Bridesmaids, mothers, and wedding guests wanting a cohesive, professional look.',
    included: [
      'Camera-ready makeup application',
      'Lash application included',
      'Setting for all-day wear'
    ],
    price: '$120',
    duration: '60 - 75 Minutes',
    prepNotes: [
      'Arrive with clean skin and zero residue from old makeup.'
    ],
    type: 'makeup'
  },
  {
    name: '1:1 Makeup Lesson',
    slug: 'makeup-lesson',
    bestFor: 'Beginners or enthusiasts wanting to master their own features and product kit.',
    included: [
      'Kit audit and product recommendations',
      'Step-by-step "half-face" demonstration',
      'Techniques for blending and skin prep',
      'Skincare education'
    ],
    price: '$200',
    duration: '3 Hours',
    prepNotes: [
      'Bring your current makeup kit and brushes.',
      'Have a notebook or phone ready for recording steps.'
    ],
    type: 'makeup'
  },
  {
    name: 'Content Creation Package',
    slug: 'content-creation-package',
    bestFor: 'Creators, brands, and influencers needing professional vertical video and social storytelling.',
    included: [
      'Strategic content planning',
      'Professional vertical video filming',
      'Edited reels or shorts (2-6 depending on session)',
      'Raw footage delivery'
    ],
    price: 'Starting at $150',
    duration: '1 - 2 Hours',
    prepNotes: [
      'Come with ideas or a brand mood board.',
      'Prepare any outfits or products to be featured in advance.'
    ],
    type: 'content'
  }
];
