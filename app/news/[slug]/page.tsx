import { client } from '@/sanity/client';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';

export const revalidate = 60;

export default async function NewsArticle({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const newsItem = await client.fetch(`
    *[_type == "news" && slug.current == $slug][0] {
      title, publishedAt, excerpt, body,
      "imageUrl": mainImage.asset->url,
      "pdfUrl": pdfDocument.asset->url
    }
  `, { slug: resolvedParams.slug });

  if (!newsItem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
          <Link href="/news" className="text-red-600 font-bold hover:underline">Return to News</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-28 md:pt-40 pb-24 font-sans selection:bg-red-100 selection:text-red-900">
      
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation / Back Button */}
        <div className="mb-8">
          <Link 
            href="/news" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 font-bold text-sm uppercase tracking-wider transition-colors group"
          >
            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to News List
          </Link>
        </div>

        {/* Editorial Header */}
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-md text-xs font-bold uppercase tracking-widest mb-6">
            Press Release
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            {newsItem.title}
          </h1>
          <div className="flex items-center gap-4 text-sm font-bold text-gray-400 uppercase tracking-widest border-t border-gray-200 pt-6">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <time dateTime={newsItem.publishedAt}>
              {new Date(newsItem.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </time>
          </div>
        </header>

        {/* Hero Image */}
        {newsItem.imageUrl && (
          <div className="relative w-full aspect-[16/9] mb-12 rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
            <Image 
              src={newsItem.imageUrl} 
              alt={newsItem.title} 
              fill 
              priority
              className="object-cover" 
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>
        )}

        {/* Article Body Content */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <div className="prose prose-lg md:prose-xl prose-gray max-w-none text-gray-700 leading-relaxed
            prose-headings:font-extrabold prose-headings:text-gray-900 prose-headings:tracking-tight
            prose-a:text-red-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-extrabold
            prose-img:rounded-xl prose-img:shadow-md
            prose-blockquote:border-l-4 prose-blockquote:border-red-600 prose-blockquote:bg-red-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-gray-800 prose-blockquote:font-medium
          ">
            {newsItem.body ? (
              <PortableText value={newsItem.body} />
            ) : (
              <p className="text-xl font-medium text-gray-600">{newsItem.excerpt}</p>
            )}
          </div>
        </div>

        {/* Elegant PDF Viewer Section */}
        {newsItem.pdfUrl && (
          <div className="mt-12 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Attached Document</h3>
                  <p className="text-sm font-medium text-gray-500">View or download the official PDF file below.</p>
                </div>
              </div>
              
              <a 
                href={newsItem.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download PDF
              </a>
            </div>
            
            <div className="bg-gray-100 p-2 md:p-3 rounded-2xl border border-gray-200 shadow-inner">
              <iframe 
                src={newsItem.pdfUrl} 
                className="w-full h-[600px] md:h-[800px] rounded-xl bg-white border border-gray-200 shadow-sm"
                title="PDF Document Viewer"
              />
            </div>
          </div>
        )}

      </article>
      
    </div>
  );
}