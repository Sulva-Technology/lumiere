const requiredServerEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
] as const;

export function getRequiredEnv(name: (typeof requiredServerEnv)[number]) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getPublicEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required public environment variable: ${name}`);
  }

  return value;
}

export function getOptionalEnv(name: string, fallback = '') {
  return process.env[name] ?? fallback;
}

export function getAdminSeedEmails() {
  return getOptionalEnv('ADMIN_SEED_EMAILS')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

