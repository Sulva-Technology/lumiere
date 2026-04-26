import { Metadata } from 'next';
import ServicesClient from './services-client';
import { getBookingServices } from '@/lib/data/public';

export const metadata: Metadata = {
  title: 'Luxury Makeup & Content Services | Itz Lola Beauty',
  description: 'Explore our premium services: Soft Glam, Full Glam, and Professional Content Creation in Arizona. Book your expert beauty session today.',
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
            Explore our curated menu of high-end makeup artistry and professional digital content creation sessions.
          </p>
        </header>

        {/* Pass live services to the client component */}
        <ServicesClient initialServices={services} />
      </div>
    </main>
  );
}
