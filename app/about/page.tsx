import { Metadata } from 'next';
import AboutClient from './about-client';

export const metadata: Metadata = {
  title: 'About Damilola | Luxury Makeup Artist in Arizona',
  description: 'Meet Damilola, the creative force behind Itz Lola Beauty. Specializing in high-end makeup artistry and professional digital storytelling in Arizona.',
};

export default function AboutPage() {
  return <AboutClient />;
}
