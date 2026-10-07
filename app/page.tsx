import HeroSlider from '@/components/HeroSlider';
import { client } from '@/sanity/client';
import Link from 'next/link';
import Image from 'next/image';
import DesignVariant from '@/components/DesignVariant';
import ClassicHome from '@/components/classic/ClassicHome';

interface SanityEvent {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  category?: string;
}

export default async function Home() {
  const today = new Date().toISOString().split('T')[0];

  // Fetch Event AND News simultaneously.
  const [event, newsItems]: [SanityEvent | null, any[]] = await Promise.all([
    client.fetch(
      `*[_type == "event" && startDate >= $today] | order(startDate asc)[0]`,
      { today }
    ),
    client.fetch(
      `*[_type == "news"] | order(publishedAt desc)[0...3] {
        _id,
        title,
        "slug": slug.current,
        publishedAt,
        excerpt,
        "imageUrl": mainImage.asset->url
      }`
    )
  ]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };


  const modern = (
    <div className="bg-gray-50">
      <HeroSlider />

      {/* Intro */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12">
          <span className="text-red-600 font-bold tracking-widest uppercase text-sm mb-5 block">
            About Our Federation
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight max-w-4xl">
            Welcome to <span className="text-red-600">JKA/AF.</span>
          </h2>

          <div className="mt-14 grid lg:grid-cols-12 gap-12 lg:gap-20">
            <p className="lg:col-span-7 text-lg sm:text-xl text-gray-600 leading-relaxed">
              The Japan Karate Association/American Federation is an affiliation of JKA clubs across the Americas, founded by Sensei Takayuki Mikami (9th dan JKA) in 2009. We promote top quality traditional karate through hosting regular training, competition &amp; instructor course events and conducting rank and qualification examinations affiliated with the Japan Karate Association headquartered in Tokyo, Japan.
            </p>

            <dl className="lg:col-span-5 grid grid-cols-2 gap-x-8 gap-y-10 content-start">
              {[
                ['2009', 'Year founded'],
                ['9th Dan', 'Founder, Sensei Mikami'],
                ['Americas', 'Affiliated JKA clubs'],
                ['Tokyo', 'JKA headquarters'],
              ].map(([k, v]) => (
                <div key={k} className="border-t border-gray-300 pt-4">
                  <dt className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{k}</dt>
                  <dd className="mt-1 text-base text-gray-500">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Featured Event */}
      <section className="bg-gray-900 text-white py-20 lg:py-28">
        <div className="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Next up.</h2>
            <Link href="/events" className="text-base font-bold text-white hover:text-red-100 underline decoration-red-600 decoration-2 underline-offset-8 transition-colors">
              View all events &rarr;
            </Link>
          </div>

          {event ? (
            <Link
              href={`/events/${event._id}`}
              className="group block rounded-3xl bg-red-600 p-8 sm:p-12 lg:p-14 transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-4 py-1.5 rounded-full bg-white text-gray-900 text-sm font-bold">
                  {formatDate(event.startDate)}
                  {event.endDate && event.endDate !== event.startDate && ` – ${formatDate(event.endDate)}`}
                </span>
                {event.category && (
                  <span className="px-4 py-1.5 rounded-full border border-white/60 text-sm font-bold">
                    {event.category}
                  </span>
                )}
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight max-w-4xl">{event.title}</h3>
              <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
                <p className="text-lg font-medium text-white/90 flex items-center gap-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {event.location}
                </p>
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white text-gray-900 text-2xl transition-transform duration-500 group-hover:-rotate-45" aria-hidden>
                  &rarr;
                </span>
              </div>
            </Link>
          ) : (
            <div className="rounded-3xl border border-white/15 p-12 text-lg text-white/60 text-center">
              No upcoming events scheduled.
            </div>
          )}
        </div>
      </section>

      {/* Latest News */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">Latest news.</h2>
            <Link href="/news" className="text-base font-bold text-gray-900 hover:text-red-600 underline decoration-red-600 decoration-2 underline-offset-8 transition-colors">
              View all news &rarr;
            </Link>
          </div>

          {newsItems && newsItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((item) => (
                <Link key={item._id} href={`/news/${item.slug}`} className="group flex flex-col">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="mt-5 text-sm font-semibold text-red-600">
                    {new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 leading-snug group-hover:text-red-600 transition-colors line-clamp-3">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-500 line-clamp-2">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white p-12 text-lg text-gray-500 text-center">
              No news published yet.
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-red-600 text-white py-20 lg:py-28">
        <div className="max-w-[90rem] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">Ready to begin?</h2>
          <p className="mt-5 text-lg sm:text-xl text-white/85 max-w-xl mx-auto">
            Become a member and train with JKA/AF dojos across the Americas.
          </p>
          <Link
            href="/membership"
            className="mt-10 inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full text-base font-bold hover:bg-gray-900 hover:text-white transition-colors"
          >
            Join JKA/AF <span aria-hidden>&rarr;</span>
          </Link>
        </div>
      </section>
    </div>
  );

  return <DesignVariant modern={modern} classic={<ClassicHome event={event} newsItems={newsItems} />} />;
}
