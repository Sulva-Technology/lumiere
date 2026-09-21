import { InfoPage } from '@/components/info-page';
import { getPublicStoreSettings } from '@/lib/data/public';

export default async function TermsOfServicePage() {
  const store = await getPublicStoreSettings();

  return (
    <InfoPage
      eyebrow="Appointment Terms"
      title="Terms & Conditions"
      intro={`Please review these appointment terms before booking with ${store.storeName}.`}
      sections={[
        {
          title: 'Booking & Retainer Fee',
          body: [
            'A non-refundable $35 retainer fee is required to secure your appointment date.',
            'Your retainer is applied toward your total service balance.',
          ],
        },
        {
          title: 'Late Policy',
          body: [
            'A 10-minute grace period is allowed. After that, a $20 late fee will be applied.',
            'Appointments exceeding 15 minutes late will be cancelled.',
          ],
        },
        {
          title: 'No-Show Policy',
          body: [
            'Failure to show up without notice will result in a charge of the full service amount and loss of the retainer.',
          ],
        },
        {
          title: 'Photography & Social Media',
          body: [
            'The artist reserves the right to take photos and video for portfolio and promotional use unless the client requests otherwise.',
          ],
        },
      ]}
    />
  );
}
