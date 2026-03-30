'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // State for mobile dropdown
  const [aboutOpen, setAboutOpen] = useState(false);

  // Animation trigger for scrolling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { 
      name: 'About JKA/AF', 
      path: '#', // Changed to '#' so it no longer links to an empty page
      dropdown: [
        { name: 'Sensei Takayuki Mikami', path: '/about/mikami' },
        { name: 'Board Members', path: '/about/board' },
        { name: 'Policies', path: '/about/policies' },
      ]
    },
    { name: 'Events', path: '/events' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Dojos', path: '/dojos' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
    { name: 'Shop', path: 'https://your-shop-link.com', external: true },
  ];

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

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
                sizes="48px"
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
              <div key={link.name} className="relative group">
                
                {/* Condition: If path is '#', render a button instead of a Link */}
                {link.path === '#' ? (
                  <button className="relative px-3 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer">
                    {link.name}
                    {link.dropdown && (
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    )}
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-red-600 transition-all duration-300 ease-out transform -translate-x-1/2 group-hover:w-[80%] rounded-full"></span>
                  </button>
                ) : (
                  <Link 
                    href={link.path}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="relative px-3 py-2 text-sm font-semibold text-gray-700 hover:text-red-600 transition-colors flex items-center gap-1.5"
                  >
                    {link.name}
                    
                    {/* External Link Icon */}
                    {link.external && (
                      <svg className="w-3.5 h-3.5 mb-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                    )}

                    {/* Dropdown Chevron */}
                    {link.dropdown && (
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    )}
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-red-600 transition-all duration-300 ease-out transform -translate-x-1/2 group-hover:w-[80%] rounded-full"></span>
                  </Link>
                )}

                {/* Desktop Dropdown */}
                {link.dropdown && (
                  <div className="absolute left-0 top-full pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out w-56 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 overflow-hidden flex flex-col gap-1">
                      {link.dropdown.map((sublink) => (
                        <Link 
                          key={sublink.name} 
                          href={sublink.path}
                          className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {sublink.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
        <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden flex flex-col py-2 max-h-[75vh] overflow-y-auto">
          {navLinks.map((link, index) => (
            <div key={link.name} className="flex flex-col border-b border-gray-50 last:border-0" style={{ transitionDelay: `${isOpen ? index * 50 : 0}ms` }}>
              <div className="flex justify-between items-center w-full">
                
                {/* Condition: Render button for # paths, Link for valid pages */}
                {link.path === '#' ? (
                  <button 
                    onClick={() => setAboutOpen(!aboutOpen)}
                    className="flex-1 px-6 py-4 flex items-center justify-between text-base font-semibold text-gray-800 hover:text-red-600 transition-colors focus:outline-none"
                  >
                    <span>{link.name}</span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${aboutOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                ) : (
                  <>
                    <Link 
                      href={link.path}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-6 py-4 text-base font-semibold text-gray-800 hover:text-red-600 transition-colors flex items-center gap-2"
                    >
                      {link.name}
                      {link.external && (
                        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                        </svg>
                      )}
                    </Link>
                    {/* Secondary chevron button for items that are actual links BUT have dropdowns */}
                    {link.dropdown && (
                      <button onClick={() => setAboutOpen(!aboutOpen)} className="p-4 mr-2 text-gray-500 hover:text-red-600 focus:outline-none">
                        <svg className={`w-5 h-5 transition-transform ${aboutOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                    )}
                  </>
                )}

              </div>
              
              {/* Mobile Dropdown Content */}
              {link.dropdown && aboutOpen && (
                <div className="bg-gray-50 flex flex-col py-2 px-6 border-t border-gray-100 border-b border-gray-100">
                  {link.dropdown.map((sublink) => (
                    <Link 
                      key={sublink.name} 
                      href={sublink.path}
                      onClick={() => setIsOpen(false)}
                      className="py-3 pl-4 text-sm font-semibold text-gray-600 hover:text-red-600 transition-colors"
                    >
                      {sublink.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-2">
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