import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PitchPulse Live',
  description: 'Live football scores, streams, events and player ratings.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
