import { Metadata } from 'next';
import HomeClient from './home-client';

export const metadata: Metadata = {
  title: 'Home',
  description: 'The definitive studio for high-end makeup artistry and professional digital content creation. Experience the new standard in creative storytelling.',
};

export default function HomePage() {
  return <HomeClient />;
}
