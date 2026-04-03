import { InfoPage } from '@/components/info-page';

export default function ShippingReturnsPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Shipping & Returns"
      intro="Our shipping and returns page helps clients understand fulfillment timing, order handling, and return expectations before they buy."
      sections={[
        {
          title: 'Shipping',
          body: [
            'Orders are created only after payment is verified and inventory is confirmed on the server.',
            'Standard shipping is free over the configured threshold. Orders below that threshold receive a flat shipping charge during checkout.',
          ],
        },
        {
          title: 'Processing',
          body: [
            'Orders move from pending to processing after payment confirmation is received securely.',
            'Fulfillment updates in the admin dashboard are reflected in the order lifecycle for internal operations.',
          ],
        },
        {
          title: 'Returns & Support',
          body: [
            'If there is an issue with your order, contact support with your order number and the email used at checkout.',
            'Return eligibility depends on product condition and whether the item has been altered, opened, or customized.',
          ],
        },
      ]}
    />
  );
}
