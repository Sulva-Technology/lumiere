
import { createSupabaseAdminClient } from './lib/supabase/admin.js';

async function updateDescriptions() {
  const supabase = createSupabaseAdminClient();
  
  const updates = [
    {
      slug: 'soft-glam',
      description: 'A natural, radiant look that enhances your features while keeping your skin looking like skin. Perfect for everyday glam, events, or photos.\nTravel Fee: A $20 travel fee applies for locations beyond a 6-mile radius.'
    },
    {
      slug: 'full-glam',
      description: 'A more defined, elevated look with fuller coverage, detailed eye makeup, and a flawless finish. Ideal for special occasions and photoshoots.\nTravel Fee: A $20 travel fee applies for locations beyond an 8-mile radius.'
    },
    {
      slug: 'social-media-video-content-30-minutes',
      description: 'Perfect for capturing quick, meaningful moments like birthdays, girls\' dinners, and family content. Deliverables: 2 edited videos (1 to 2 minutes each), raw video footage included, up to 2 revision rounds.\nTravel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.'
    },
    {
      slug: 'video-content-session-1-hour',
      description: 'Ideal for event coverage and personal branding content with more depth and variety. Deliverables: 3 edited videos (1 to 2 minutes each), raw video footage included, up to 2 revision rounds.\nTravel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.'
    },
    {
      slug: 'premium-video-content-session-2-hours',
      description: 'Best for brands, events, and creators who need a higher volume of content from one session. Deliverables: 6 edited videos (1 to 2 minutes each), raw video footage included, up to 4 revision rounds.\nTravel Policy: A $20 travel fee applies for locations beyond an 8-mile radius.'
    }
  ];

  for (const update of updates) {
    console.log(`Updating ${update.slug}...`);
    const { error } = await supabase
      .from('booking_services')
      .update({ description: update.description })
      .eq('slug', update.slug);
    
    if (error) {
      console.error(`Error updating ${update.slug}:`, error);
    } else {
      console.log(`Successfully updated ${update.slug}`);
    }
  }
}

updateDescriptions();
