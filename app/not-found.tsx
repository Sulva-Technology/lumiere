import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h2 className="text-4xl font-serif text-[var(--text-primary)] mb-4">Page Not Found</h2>
      <p className="text-[var(--text-secondary)] mb-8">Could not find requested resource</p>
      <Link 
        href="/"
        className="px-8 py-4 rounded-full bg-[#8B6914] dark:bg-[#D4A847] text-white dark:text-[#1A1008] font-medium hover:opacity-90 transition-opacity"
      >
        Return Home
      </Link>
    </div>
  );
}
