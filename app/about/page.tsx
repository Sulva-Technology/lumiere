import { Metadata } from 'next';
import AboutClient from './about-client';

export const metadata: Metadata = {
  title: 'About Lola | Luxury Makeup Artist in Arizona',
  description: 'Meet Lola, the artist behind Itz Lola Beauty and its personalized luxury glam experience.',
};

export default function AboutPage() {
  return <AboutClient />;
}
