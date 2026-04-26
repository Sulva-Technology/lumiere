'use client';

import { motion } from 'motion/react';
import { Glass } from '@/components/ui/glass';
import Link from 'next/link';
import { ArrowRight, Clock, DollarSign } from 'lucide-react';
import Image from 'next/image';
import type { BookingService } from '@/lib/types';
import { formatCurrency } from '@/lib/format';

interface ServicesClientProps {
  initialServices: BookingService[];
}

export default function ServicesClient({ initialServices }: ServicesClientProps) {
  // Use the live services from the database
  const services = initialServices;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link href={`/book?type=${service.serviceType}&service=${service.id}`} className="group block h-full">
            <Glass level="medium" className="flex h-full flex-col overflow-hidden transition-all duration-500 hover:scale-[1.02]">
              <div className="relative h-48 w-full overflow-hidden">
                 <Image 
                    src={`/images/${service.serviceType === 'content' ? 'content.jpeg' : 'makeup.jpeg'}`}
                    alt={service.name}
                    fill
                    className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-4 left-6 right-4">
                    <h3 className="font-serif text-2xl text-white">{service.name}</h3>
                 </div>
              </div>
              
              <div className="flex flex-1 flex-col p-6">
                <p className="mb-6 line-clamp-3 text-sm text-[var(--text-secondary)]">
                  {service.description?.split('\n\n')[0] || service.name}
                </p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <DollarSign size={16} className="text-[var(--text-accent)]" />
                    <span>{formatCurrency(service.price)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Clock size={16} className="text-[var(--text-accent)]" />
                    <span>{service.durationMinutes} Minutes</span>
                  </div>
                  <div className="pt-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[var(--text-accent)]">
                    Book This Session <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Glass>
          </Link>
        </motion.div>
      ))}
      
      {services.length === 0 && (
        <div className="col-span-full py-12 text-center text-[var(--text-secondary)]">
          No services are currently active. Please check back later.
        </div>
      )}
    </div>
  );
}
