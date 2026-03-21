import { Glass } from '@/components/ui/glass';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Glass level="heavy" className="p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--text-accent)]">Contact</p>
          <h1 className="headline-strong mt-4 font-serif text-4xl">We&apos;re Here to Help</h1>
          <div className="mt-6 space-y-4 text-[var(--text-secondary)]">
            <p>Support: support@lumiere.com</p>
            <p>Bookings: bookings@lumiere.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            <p>Hours: Monday to Saturday, 9 AM to 6 PM</p>
          </div>
        </Glass>

        <Glass level="medium" className="p-8">
          <h2 className="headline-strong font-serif text-2xl">Send a Message</h2>
          <form className="mt-6 space-y-4">
            <input placeholder="Full name" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
            <input placeholder="Email address" type="email" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
            <input placeholder="Order or booking reference" className="w-full rounded-full bg-[var(--input-bg)] px-5 py-3 outline-none" />
            <textarea placeholder="How can we help?" className="min-h-36 w-full rounded-3xl bg-[var(--input-bg)] px-5 py-4 outline-none" />
            <button type="button" className="rounded-full bg-[#8B6914] px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 dark:bg-[#D4A847] dark:text-[#1A1008]">
              Submit
            </button>
          </form>
        </Glass>
      </div>
    </div>
  );
}
