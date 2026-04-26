// Ad placement slot. Renders the AdSense unit only when NEXT_PUBLIC_ADSENSE_CLIENT
// is set at build time, otherwise renders nothing. This keeps the JSX in place
// for placement parity once AdSense is approved, without rendering empty markup pre-approval.

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

type Placement = 'header' | 'sidebar' | 'mid-content' | 'feed-inline';

const SLOT_IDS: Record<Placement, string | undefined> = {
  header: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HEADER,
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  'mid-content': process.env.NEXT_PUBLIC_ADSENSE_SLOT_MID,
  'feed-inline': process.env.NEXT_PUBLIC_ADSENSE_SLOT_FEED,
};

export function AdSlot({ placement, className = '' }: { placement: Placement; className?: string }) {
  if (!CLIENT) return null;
  const slot = SLOT_IDS[placement];
  if (!slot) return null;

  return (
    <div className={`ad-slot ad-${placement} ${className}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
