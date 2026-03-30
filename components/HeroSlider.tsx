'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function HeroSlider() {
  const slides = [
    { 
      id: 1, 
      title: 'Experience Authentic Shotokan', 
      subtitle: 'Train with the world\'s most recognized Shotokan organization in the USA.',
      // Fixed: Use exactly /slider_1.jpg (assuming the file is in your public folder)
      img: '/slider_1.png' 
    },
    { 
      id: 2, 
      title: 'Join the JKA/AF Family', 
      subtitle: 'Find a registered dojo near you and begin your journey.',
      // Fixed path here too. You can change this to slider_2.jpg later!
      img: '/slider_1.png' 
    },
  ];

  const [current, setCurrent] = useState(0);

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
               <button className="bg-red-600 text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-red-700 transition-all">
                 Join Now
               </button>
               <button className="bg-white text-gray-800 border border-gray-200 px-8 py-3 rounded-full font-bold shadow-sm hover:bg-gray-50 transition-all">
                 Learn More
               </button>
            </div>
          </div>

          {/* Actual Image Area */}
          <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-full bg-gray-100">
            {/* We replaced the text placeholder with the actual Image component */}
            <Image 
              src={slides[current].img}
              alt={slides[current].title}
              fill
              priority
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