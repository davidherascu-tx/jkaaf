import { trackingUrl } from '@/lib/carriers';

/** "Shipped via UPS · Tracking 1Z999 (link)". Renders nothing when there is nothing to show. */
export default function TrackingInfo({ carrier, tracking }: { carrier: string; tracking: string }) {
  if (!carrier && !tracking) return null;
  const url = trackingUrl(carrier, tracking);
  return (
    <span className="text-gray-600">
      {carrier && <>Via {carrier}</>}
      {carrier && tracking && ' · '}
      {tracking && (
        <>
          Tracking:{' '}
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="font-semibold text-red-600 hover:underline">
              {tracking}
            </a>
          ) : (
            tracking
          )}
        </>
      )}
    </span>
  );
}
