import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SERVICES } from '@/lib/data/services';
import { notFound } from 'next/navigation';
import ServiceDetailClient from './service-detail-client';

export async function generateStaticParams() {
  return SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) return { title: 'Service Not Found' };

  return {
    title: `${service.name} | Luxury Makeup & Content`,
    description: service.bestFor,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);

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

        <ServiceDetailClient service={service} />
      </div>
    </main>
  );
}
