import { client } from '@/sanity/client';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';

export const revalidate = 60;

export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  // Fetching the array of gallery images
  const newsItem = await client.fetch(`
    *[_type == "news" && slug.current == $slug][0] {
      title, publishedAt, body,
      "imageUrl": mainImage.asset->url,
      "gallery": gallery[].asset->url,
      "pdfUrl": pdfDocument.asset->url
    }
  `, { slug: resolvedParams.slug });

  if (!newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-28">
        <div className="text-center bg-white p-10 rounded-2xl shadow-sm border border-gray-200 max-w-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Article Not Found</h2>
          <p className="text-gray-500 mb-6">This news item could not be found.</p>
          <Link href="/news" className="inline-flex items-center justify-center bg-red-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
            Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-32 pb-24 font-sans">
      
      {/* 1. EXACT SAME DESIGN, JUST WIDER (max-w-7xl) */}
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* OUTSIDE THE BOX: Back Button & Date */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link 
            href="/news" 
            className="inline-flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to News
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-lg text-sm font-bold border border-gray-200 shadow-sm w-fit">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            {new Date(newsItem.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        {/* INSIDE THE BOX: Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-8 md:p-12">
            
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
              {newsItem.title}
            </h1>

            {/* 2. FULL UN-CROPPED IMAGE with tighter bottom margin */}
            {newsItem.imageUrl && (
              <div className="w-full mb-6 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <Image 
                  src={`${newsItem.imageUrl}?format=auto`} 
                  alt={newsItem.title} 
                  width={1600}
                  height={900}
                  priority={true}
                  className="w-full h-auto" 
                  sizes="(max-width: 1280px) 100vw, 1200px"
                />
              </div>
            )}

            {/* Article Body */}
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed
              prose-headings:font-bold prose-headings:text-gray-900
              prose-a:text-red-600 prose-a:font-semibold hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-bold
            ">
              {newsItem.body && <PortableText value={newsItem.body} />}
            </div>

            {/* Unlimited Photo Gallery (Full un-cropped pictures) */}
            {newsItem.gallery && newsItem.gallery.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {newsItem.gallery.map((url: string, index: number) => (
                    <div key={index} className="w-full rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow bg-gray-50">
                      <Image 
                        src={`${url}?format=auto`} 
                        alt={`${newsItem.title} - Picture ${index + 1}`} 
                        width={800}
                        height={600}
                        priority={index < 2}
                        className="w-full h-auto hover:scale-105 transition-transform duration-500" 
                        sizes="(max-width: 1024px) 33vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Embedded PDF Viewer (Attached directly to the Download button) */}
        {newsItem.pdfUrl && (
          <div className="mt-8">
            <div className="flex justify-end mb-4">
              <a 
                href={newsItem.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download PDF
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-2 h-[800px]">
              <iframe 
                src={newsItem.pdfUrl} 
                className="w-full h-full bg-gray-50 rounded-lg"
                title="PDF Viewer"
              />
            </div>
          </div>
        )}

      </article>
      
    </div>
  );
}