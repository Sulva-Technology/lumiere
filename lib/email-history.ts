export const emailKindLabels = {
  booking_confirmation: 'Booking confirmation',
  booking_rescheduled: 'Booking rescheduled',
  booking_service_changed: 'Booking service changed',
  order_confirmation: 'Order confirmation',
  order_status_update: 'Order status update',
  other: 'Manual / other email',
} as const;

export const emailStatusLabels = {
  sent: 'Sent', delivered: 'Delivered', opened: 'Opened', clicked: 'Clicked',
  bounced: 'Bounced', failed: 'Failed', complained: 'Marked as spam',
  canceled: 'Canceled', delivery_delayed: 'Delivery delayed', queued: 'Queued', scheduled: 'Scheduled',
} as const;

export type EmailHistoryEntry = {
  id: string;
  createdAt: string;
  kind: keyof typeof emailKindLabels;
  description: string;
  reference?: string;
  recipients: string[];
  subject: string;
  status: keyof typeof emailStatusLabels;
};

// Recognize our existing subjects so historical emails can be described too.
// Unknown subjects stay explicitly unclassified.
export function describeEmail(subject: string): Pick<EmailHistoryEntry, 'kind' | 'description' | 'reference'> {
  const patterns: Array<[RegExp, EmailHistoryEntry['kind'], string]> = [
    [/^Booking moved: (.+)$/i, 'booking_rescheduled', 'Appointment rescheduling notification for the team.'],
    [/ updated booking confirmation (.+)$/i, 'booking_rescheduled', 'Updated appointment confirmation for the client.'],
    [/^Booking service changed: (.+)$/i, 'booking_service_changed', 'Service change notification for the team.'],
    [/ booking service change (.+)$/i, 'booking_service_changed', 'Updated service confirmation for the client.'],
    [/^New booking confirmed: (.+)$/i, 'booking_confirmation', 'Booking confirmation for the team.'],
    [/ booking confirmation (.+)$/i, 'booking_confirmation', 'Booking confirmation for the client.'],
    [/^New paid order: (.+)$/i, 'order_confirmation', 'Paid order notification for the team.'],
    [/ order confirmation (.+)$/i, 'order_confirmation', 'Order confirmation for the customer.'],
    [/ order update (.+)$/i, 'order_status_update', 'Order status update for the customer.'],
  ];
  for (const [pattern, kind, description] of patterns) {
    const match = subject.match(pattern);
    if (match) return { kind, description, reference: match[1] };
  }
  return { kind: 'other', description: 'Manual message or other outgoing email.' };
}
