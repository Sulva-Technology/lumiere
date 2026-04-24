alter table public.store_settings
  add column if not exists homepage_testimonials jsonb not null default '[
    {
      "quote": "Lola made me feel so calm and confident. My glam stayed flawless the entire evening and photographed beautifully.",
      "name": "Danielle A.",
      "context": "Birthday glam client"
    },
    {
      "quote": "The experience felt elevated from start to finish. She listened to exactly what I wanted and delivered a soft glam that still felt like me.",
      "name": "Michelle O.",
      "context": "Soft glam client"
    },
    {
      "quote": "Professional, warm, and incredibly talented. My bridal preview gave me so much peace of mind for the wedding morning.",
      "name": "Tosin E.",
      "context": "Bridal preview client"
    }
  ]'::jsonb;
