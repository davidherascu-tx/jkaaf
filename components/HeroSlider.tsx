'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const slides = [
  {
    id: 1,
    kicker: 'Traditional Shotokan',
    title: 'Authentic Shotokan.',
    subtitle: "Train with the world's most recognized Shotokan organization in the USA.",
    img: '/slider_1.webp',
  },
  {
    id: 2,
    kicker: 'Find your dojo',
    title: 'Join the family.',
    subtitle: 'Find a registered dojo near you and begin your journey.',
    img: '/kumite_2.png',
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[88vh] w-full bg-gray-900 text-white overflow-hidden flex items-end">
      {/* Crossfading background images */}
      {slides.map((slide, i) => (
        <Image
          key={slide.id}
          src={slide.img}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-gray-900/20" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 pb-14 sm:pb-20 pt-40">
        <p
          key={`k-${current}`}
          className="fade-up inline-flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-white/80 mb-5"
        >
          <span className="w-8 h-0.5 bg-red-600" />
          {slides[current].kicker}
        </p>

        <h1
          key={`t-${current}`}
          className="fade-up text-5xl leading-[1.02] sm:text-5xl lg:text-6xl font-extrabold max-w-3xl"
        >
          {slides[current].title}
        </h1>

        <p
          key={`s-${current}`}
          className="fade-up mt-6 text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed"
          style={{ animationDelay: '0.12s' }}
        >
          {slides[current].subtitle}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/membership"
            className="inline-flex items-center gap-3 bg-red-600 text-white px-7 py-3.5 rounded-full text-base font-bold hover:bg-white hover:text-gray-900 transition-colors"
          >
            Join Now <span aria-hidden>&rarr;</span>
          </Link>
          <Link
            href="/dojos"
            className="inline-flex items-center gap-3 border border-white/40 text-white px-7 py-3.5 rounded-full text-base font-bold hover:border-white hover:bg-white/10 transition-colors"
          >
            Find a Dojo
          </Link>

          <div className="ml-auto flex items-center gap-3" role="tablist" aria-label="Slides">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                role="tab"
                aria-selected={index === current}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === current ? 'w-14 bg-red-600' : 'w-6 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
