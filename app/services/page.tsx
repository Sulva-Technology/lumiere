import { Metadata } from 'next';
import ServicesClient from './services-client';
import { getBookingServices } from '@/lib/data/public';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Luxury Makeup Services | Itz Lola Beauty',
  description: 'Explore Soft Glam and Full Glam makeup appointments in Arizona.',
};

export default async function ServicesPage() {
  // Fetch live services from the same source as the booking flow
  const services = await getBookingServices();

  return (
    <main className="min-h-screen px-4 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 text-center space-y-4">
          <h1 className="font-serif text-5xl md:text-6xl text-[var(--text-primary)]">
            Studio Services
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[var(--text-secondary)]">
            Explore our curated menu of high-end makeup artistry for your next occasion.
          </p>
        </header>

        {/* Pass live services to the client component */}
        <ServicesClient initialServices={services} />
      </div>
    </main>
  );
}
