import { InfoPage } from '@/components/info-page';

export default function PrivacyPolicyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This page explains the information used to operate the storefront, booking flow, checkout, and admin experience."
      sections={[
        {
          title: 'Information We Use',
          body: [
            'We use customer contact details, shipping details, and booking details to fulfill orders and salon reservations.',
            'Payment card details are handled by Stripe and are not stored directly in this application.',
          ],
        },
        {
          title: 'Operational Systems',
          body: [
            'Product, booking, customer, and order records are stored securely to operate the storefront and support services.',
            'Administrative access is restricted to authorized staff accounts.',
          ],
        },
        {
          title: 'Support & Retention',
          body: [
            'Support interactions may reference your order or booking details so we can assist with fulfillment and scheduling.',
            'Formal legal text should be reviewed by counsel before launch if this site is going live publicly.',
          ],
        },
      ]}
    />
  );
}
