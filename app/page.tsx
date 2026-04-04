import { Metadata } from 'next';
import HomeClient from './home-client';
import { getStoreSettings } from '@/lib/data/admin';

export const metadata: Metadata = {
  title: 'Home',
  description: 'The definitive studio for high-end makeup artistry and professional digital content creation. Experience the new standard in creative storytelling.',
};

export default async function HomePage() {
  const settings = await getStoreSettings();
  return <HomeClient settings={settings} />;
}
