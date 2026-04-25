import { Metadata } from 'next';
import ServicesClient from './services-client';

export const metadata: Metadata = {
  title: 'Luxury Makeup & Content Services | Itz Lola Beauty',
  description: 'Explore our premium services: Soft Glam, Full Glam, Bridal Artistry, and Professional Content Creation in Arizona. Book your expert beauty session today.',
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen px-4 pb-24 pt-32">
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 text-center space-y-4">
          <h1 className="font-serif text-5xl md:text-6xl text-[#1A1008] dark:text-white">
            Studio Services
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[var(--text-secondary)]">
            Explore our curated menu of high-end makeup artistry and professional digital content creation sessions.
          </p>
        </header>

        <ServicesClient />
      </div>
    </main>
  );
}
