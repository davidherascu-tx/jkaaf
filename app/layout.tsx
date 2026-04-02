import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'JKA/AF | Japan Karate Association / American Federation',
  description: 'Official website for the JKA/AF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* CHANGED: bg-gray-50 replaces bg-white so the background gap is perfectly gray */}
      <body className="bg-gray-50 text-black min-h-screen flex flex-col" suppressHydrationWarning>
        <Navbar />
        
        {/* The 'flex-grow' safely pushes the footer to the bottom */}
        <main className="flex-grow flex flex-col">{children}</main>
        
        <Footer />
      </body>
    </html>
  );
}