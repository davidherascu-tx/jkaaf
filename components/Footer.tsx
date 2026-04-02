'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide the footer entirely if we are on the Sanity Studio admin page
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center md:items-start text-center md:text-left">
          
          {/* Column 1: Brand / Logo */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <Image 
                src="/jkaaf_logo.png" 
                alt="JKA/AF Official Logo" 
                width={50} 
                height={50} 
                className="object-contain transition-transform group-hover:scale-105 w-auto h-auto" 
              />
              <div className="flex flex-col justify-center text-left">
                <span className="text-lg font-extrabold tracking-widest text-gray-900 leading-none">
                  日本空手協会
                </span>
                <span className="text-xs font-bold text-red-600 tracking-wider mt-1">
                  JKA/AF
                </span>
              </div>
            </Link>
          </div>

          {/* Column 2: Contact Information */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Contact</h3>
            <a href="mailto:JKAAFUSA@gmail.com" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              JKAAFUSA@gmail.com
            </a>
            <a href="tel:5048356825" className="text-gray-600 hover:text-red-600 transition-colors font-medium">
              (504) 835-6825
            </a>
          </div>

          {/* Column 3: Social Media */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">Follow</h3>
            <div className="flex gap-4">
              {/* Facebook Icon */}
              <a 
                href="https://www.facebook.com/groups/238228469631491/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-blue-600 transition-colors" 
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>

              {/* Instagram Icon */}
              <a 
                href="https://www.instagram.com/jkaafusa/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-pink-600 transition-colors" 
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>

              {/* YouTube Icon */}
              <a 
                href="https://www.youtube.com/@JKAAmericanFederation" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-red-600 transition-colors" 
                aria-label="YouTube"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Japan Karate Association / American Federation. All Rights Reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}