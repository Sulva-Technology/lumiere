import { InfoPage } from '@/components/info-page';
import { getPublicStoreSettings } from '@/lib/data/public';

export default async function FaqPage() {
  const store = await getPublicStoreSettings();

  return (
    <InfoPage
      eyebrow="Customer Care"
      title="Frequently Asked Questions"
      intro={`Everything clients usually ask before shopping, booking, or checking out with ${store.storeName}.`}
      sections={[
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
      ]}
    />
  );
}
