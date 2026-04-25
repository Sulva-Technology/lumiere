import { Metadata } from 'next';
import { InfoPage } from '@/components/info-page';
import { getPublicStoreSettings } from '@/lib/data/public';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'FAQ | Booking, Deposits & Policies',
  description: 'Common questions about makeup bookings, content creation sessions, deposits, and studio policies at Itz Lola Beauty.',
};

export default async function FaqPage() {
  const store = await getPublicStoreSettings();

  const sections = [
    {
      title: 'Orders',
      body: [
        'Orders are confirmed after payment is verified and your purchase is recorded successfully.',
        'You will receive email confirmation once the order is placed and another update when fulfillment begins.',
      ],
    },
    {
      title: 'Bookings',
      body: [
        'Bookings reserve a real availability slot with your selected artist and service.',
        'Online booking collects payment during the secure checkout flow before an appointment is confirmed.',
      ],
    },
    {
      title: 'Returns',
      body: [
        'Unaltered hair and beauty products can be reviewed for return eligibility according to the store return policy.',
        'Opened, worn, or customized products are usually not eligible for return unless there is a verified fulfillment issue.',
      ],
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://itzlolabeauty.com'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'FAQ',
            'item': 'https://itzlolabeauty.com/faq'
          }
        ]
      },
      {
        '@type': 'FAQPage',
        'mainEntity': sections.map((s) => ({
          '@type': 'Question',
          'name': s.title,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': s.body.join(' '),
          },
        })),
      }
    ]
  };

  return (
    <>
      <JsonLd data={schema} />
      <InfoPage
        eyebrow="Customer Care"
        title="Frequently Asked Questions"
        intro={`Everything clients usually ask before shopping, booking, or checking out with ${store.storeName}.`}
        sections={sections}
      />
    </>
  );
}
