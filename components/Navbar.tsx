'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Animation trigger for scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About JKA/AF', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Calendar', path: '/calendar' }, // NEW!
    { name: 'Dojos', path: '/dojos' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Hide the navbar entirely if we are on the Sanity Studio admin page
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 mt-4 sm:mt-6 flex justify-center pointer-events-none">
      <nav 
        className={`pointer-events-auto w-full max-w-7xl bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg rounded-lg transition-all duration-300 ease-in-out ${
          scrolled ? 'py-2 px-4 sm:px-6' : 'py-4 px-6 sm:px-8'
        }`}
      >
        <div className="flex justify-between items-center">
          
          {/* Logo & Kanji Section */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-300 group-hover:scale-105">
              <Image 
                src="/jkaaf_logo.png" 
                alt="JKA/AF Official Logo" 
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg sm:text-xl font-extrabold tracking-widest text-gray-900 leading-tight">
                日本空手協会
              </span>
              <span className="text-xs sm:text-sm font-bold text-red-600 tracking-wider">
                JKA/AF
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.path}
                className="relative px-3 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors group"
              >
                {link.name}
                {/* Animated underline effect on hover */}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-red-600 transition-all duration-300 ease-out transform -translate-x-1/2 group-hover:w-[80%] rounded-full"></span>
              </Link>
            ))}
            
            {/* Elegant Join Button */}
            <div className="pl-3 ml-2 border-l border-gray-200">
              <Link 
                href="/membership"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:border-red-600 hover:text-red-600 transition-all bg-white"
              >
                Join JKA/AF
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-red-600 focus:outline-none transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between relative">
              <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>

        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`absolute top-[110%] left-0 right-0 px-4 sm:px-6 pointer-events-auto transition-all duration-400 ease-in-out lg:hidden origin-top ${
          isOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden flex flex-col py-2">
          {navLinks.map((link, index) => (
            <Link 
              key={link.name} 
              href={link.path}
              onClick={() => setIsOpen(false)}
              className="px-6 py-4 text-base font-semibold text-gray-800 border-b border-gray-50 last:border-0 hover:bg-red-50 hover:text-red-600 transition-colors"
              style={{
                transitionDelay: `${isOpen ? index * 50 : 0}ms`
              }}
            >
              {link.name}
            </Link>
          ))}
          
          {/* Mobile Join Button */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
            <Link 
              href="/membership"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center px-4 py-3 text-base font-semibold text-gray-700 border border-gray-300 rounded-lg hover:border-red-600 hover:text-red-600 transition-colors bg-white"
            >
              Join JKA/AF
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}