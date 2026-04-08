import { Metadata } from 'next';
import { getProducts, getPublicStoreSettings } from '@/lib/data/public';
import HomeClient from './home-client';

export const metadata: Metadata = {
  title: 'Home',
  description: 'The definitive studio for high-end makeup artistry and professional digital content creation. Experience the new standard in creative storytelling.',
};

export default async function HomePage() {
  const [products, store] = await Promise.all([getProducts(), getPublicStoreSettings()]);
  const favoriteItems = products.filter((product) => product.featured).slice(0, 3);
  return <HomeClient favoriteItems={favoriteItems} showFavorites={store.homeFavoritesEnabled} />;
}
