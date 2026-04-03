'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSlider() {
  const slides = [
    { 
      id: 1, 
      title: 'Experience Authentic Shotokan', 
      subtitle: 'Train with the world\'s most recognized Shotokan organization in the USA.',
      img: '/slider_1.webp' 
    },
    { 
      id: 2, 
      title: 'Join the JKA/AF Family', 
      subtitle: 'Find a registered dojo near you and begin your journey.',
      img: '/kumite_2.png' 
    }
  ];

  const [current, setCurrent] = useState(0);

  // Set up auto-rotation every 5 seconds (5000 milliseconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000); 

    // Cleanup the timer when the component unmounts
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="w-full bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          
          {/* Text Content */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white z-10">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {slides[current].title}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {slides[current].subtitle}
            </p>
            <div className="flex gap-4 flex-wrap">
               <Link href="/membership" className="inline-block bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-red-700 transition-all text-center">
                 Join Now
               </Link>
               {/* Learn More button has been successfully removed */}
            </div>
          </div>

          {/* Actual Image Area */}
          <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full bg-gray-100">
            <Image 
              src={slides[current].img}
              alt={slides[current].title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw" // Fixes the Next.js warning
              className="object-cover"
            />
          </div>

        </div>
        
        {/* Simple Dot Navigation below the card */}
        <div className="flex justify-center space-x-3 mt-6">
          {slides.map((_, index) => (
            <button 
              key={index} 
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition-colors ${index === current ? 'bg-red-600' : 'bg-gray-300'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}