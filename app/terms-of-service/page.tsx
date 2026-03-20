import { InfoPage } from '@/components/info-page';

export default function TermsOfServicePage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of Service"
      intro="These terms describe how customers use Lumiere’s storefront, appointment booking flow, and support channels."
      sections={[
        {
          title: 'Storefront Purchases',
          body: [
            'Orders are subject to product availability and successful payment confirmation.',
            'Displayed availability can change quickly, so final inventory validation happens server-side during checkout.',
          ],
        },
        {
          title: 'Appointments',
          body: [
            'Booking a salon appointment reserves a live slot based on available stylist schedules.',
            'Clients should contact the salon promptly if they need to reschedule or cancel an appointment.',
          ],
        },
        {
          title: 'Platform Use',
          body: [
            'Customers agree not to misuse the storefront, booking forms, or support channels.',
            'This draft should be reviewed and expanded with legal counsel before public launch.',
          ],
        },
      ]}
    />
  );
}
