import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClassicNavbar from '@/components/classic/ClassicNavbar';
import ClassicFooter from '@/components/classic/ClassicFooter';
import DesignVariant from '@/components/DesignVariant';
import DesignToggle from '@/components/DesignToggle';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Runs before first paint: ?design=classic|modern wins, else the saved choice, else modern.
const designScript = `try{var q=new URLSearchParams(location.search).get('design');var d=(q==='classic'||q==='modern')?q:localStorage.getItem('design');if(q==='classic'||q==='modern')localStorage.setItem('design',q);document.documentElement.dataset.design=d==='classic'?'classic':'modern'}catch(e){document.documentElement.dataset.design='modern'}`;

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
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: designScript }} />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col" suppressHydrationWarning>
        <DesignVariant modern={<Navbar />} classic={<ClassicNavbar />} />
        <main className="flex-grow flex flex-col">{children}</main>
        <DesignVariant modern={<Footer />} classic={<ClassicFooter />} />
        <DesignToggle />
      </body>
    </html>
  );
}
