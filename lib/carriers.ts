export const CARRIERS = ['U.S. Post (USPS)', 'UPS', 'FedEx', 'DHL', 'Other'] as const;

const TRACK_URL: Record<string, string> = {
  'U.S. Post (USPS)': 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  UPS: 'https://www.ups.com/track?tracknum=',
  FedEx: 'https://www.fedex.com/fedextrack/?trknbr=',
  DHL: 'https://www.dhl.com/us-en/home/tracking.html?tracking-id=',
};

/** Link to the carrier's tracking page, or null when the carrier is unknown / "Other". */
export function trackingUrl(carrier: string, tracking: string): string | null {
  const base = TRACK_URL[carrier];
  const num = tracking.trim();
  return base && num ? base + encodeURIComponent(num) : null;
}
