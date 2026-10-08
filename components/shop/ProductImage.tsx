/* eslint-disable @next/next/no-img-element */
// Plain <img> on purpose: admins can paste any image URL, which next/image would require to be allow-listed.
export default function ProductImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`bg-gray-100 flex items-center justify-center overflow-hidden ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-contain p-6" loading="lazy" />
      ) : (
        <span className="text-5xl font-extrabold text-gray-300" aria-hidden>
          {alt.slice(0, 1)}
        </span>
      )}
    </div>
  );
}
