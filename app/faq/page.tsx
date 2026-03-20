import { InfoPage } from '@/components/info-page';

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Customer Care"
      title="Frequently Asked Questions"
      intro="Everything clients usually ask before shopping, booking, or checking out with Lumiere."
      sections={[
        {
          title: 'Orders',
          body: [
            'Orders are confirmed after Stripe payment succeeds and our system records the order in Supabase.',
            'You will receive email confirmation once the order is placed and another update when fulfillment begins.',
          ],
        },
        {
          title: 'Bookings',
          body: [
            'Salon bookings reserve a real availability slot with your selected stylist and service.',
            'Online booking does not collect payment for salon services in this first release. Payment is handled in salon unless your team later enables deposits.',
          ],
        },
        {
          title: 'Returns',
          body: [
            'Unaltered hair products can be reviewed for return eligibility according to the store return policy.',
            'Opened, worn, or customized products are usually not eligible for return unless there is a verified fulfillment issue.',
          ],
        },
      ]}
    />
  );
}
