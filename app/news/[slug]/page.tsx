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

  if (!newsItem) return <div className="min-h-screen flex items-center justify-center pt-28">Article not found.</div>;

  return (
    <div className="bg-white min-h-screen pt-28 md:pt-36 pb-24">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link href="/news" className="text-red-600 hover:text-red-800 font-semibold mb-8 inline-block">&larr; Back to News</Link>

        <header className="mb-10 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase mb-4">{new Date(newsItem.publishedAt).toLocaleDateString()}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{newsItem.title}</h1>
        </header>

        {newsItem.imageUrl && (
          <div className="relative w-full h-[400px] mb-12 rounded-2xl overflow-hidden shadow-md">
            <Image src={newsItem.imageUrl} alt={newsItem.title} fill className="object-cover" />
          </div>
        )}

        {/* Render Rich Text Body */}
        <div className="text-lg text-gray-700 leading-relaxed space-y-6">
          {newsItem.body ? (
             <PortableText value={newsItem.body} />
          ) : (
            <p>{newsItem.excerpt}</p>
          )}
        </div>

        {/* PDF Embedded Viewer */}
        {newsItem.pdfUrl && (
          <div className="mt-16 border-t border-gray-100 pt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Attached Document</h3>
            <div className="bg-gray-100 p-2 rounded-2xl border border-gray-200">
              <iframe src={newsItem.pdfUrl} className="w-full h-[800px] rounded-xl bg-white" title="PDF Document Viewer" />
            </div>
          </div>
        )}

      </article>
    </div>
  );
}