import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBookingServices } from '@/lib/data/public';
import { SERVICES } from '@/lib/data/services';
import { notFound } from 'next/navigation';
import ServiceDetailClient from './service-detail-client';

// Use static list so this works at build time without a DB connection
export function generateStaticParams() {
  return SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

// Allow new slugs added via admin to be served dynamically
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const services = await getBookingServices();
  const service = services.find((s) => s.slug === slug);

  if (!service) return { title: 'Service Not Found' };

  return {
    title: `${service.name} | Luxury Makeup & Content`,
    description: service.bestFor || service.description || '',
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const services = await getBookingServices();
  const service = services.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 pb-24 pt-32">
      <div className="mx-auto max-w-4xl">
        <Link 
          href="/services" 
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft size={16} /> Back to Services
        </Link>

        {/* Pass the live database service to the client */}
        <ServiceDetailClient service={service} />
      </div>
    </main>
  );
}
