'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Glass } from '@/components/ui/glass';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push('/admin');
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-12">
      <Glass level="heavy" className="w-full p-10">
        <h1 className="font-serif text-4xl text-[#1A1008] dark:text-white">Admin Sign In</h1>
        <p className="mt-3 text-[var(--text-secondary)]">Use a Supabase staff account that also exists in the `staff_users` table.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" className="w-full rounded-full bg-white/30 px-5 py-3 outline-none dark:bg-black/30" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" className="w-full rounded-full bg-white/30 px-5 py-3 outline-none dark:bg-black/30" />
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#8B6914] py-4 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-[#D4A847] dark:text-[#1A1008]"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </Glass>
    </div>
  );
}
