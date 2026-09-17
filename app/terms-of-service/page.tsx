import { InfoPage } from '@/components/info-page';
import { getPublicStoreSettings } from '@/lib/data/public';

export default async function TermsOfServicePage() {
  const store = await getPublicStoreSettings();

  return (
    <InfoPage
      eyebrow="Booking Policies"
      title="Terms & Conditions"
      intro={`Please review these appointment terms before booking with ${store.storeName}.`}
      sections={[
        {
          title: 'Booking & Retainer Fee',
          body: [
            'A non-refundable retainer fee of $35 is required to secure your appointment date.',
            'The retainer is applied to your service total.',
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
          title: 'Rescheduling & No-Show Policy',
          body: [
            'To reschedule, please contact us at least 24 hours before your scheduled appointment. Your retainer may be transferred to one new appointment date with proper notice.',
            'Failure to show up without notice results in loss of the retainer and a charge for the service.',
          ],
        },
        {
          title: 'Travel, Same-Day & Photo Use',
          body: [
            'Travel appointments are quoted directly by the artist. Text 224-722-9644 before booking to request a travel quote.',
            'Same-day appointments include a $50 booking-fee add-on. The artist may photograph completed looks for portfolio and promotional use unless you request otherwise.',
          ],
        },
      ]}
    />
  );
}
