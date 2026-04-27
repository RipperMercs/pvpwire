// Cloudflare Pages Function. Returns visitor IP, location, ISP from the
// Cloudflare edge metadata. Zero external API calls, no API keys required.
//
// Auto-mounted at pvpwire.com/api/network-info because Pages picks up every
// `functions/api/*.ts` file. Coexists with the separate worker at
// pvpwire-api.workers.dev (which serves /api/news, /api/live-now, etc.) since
// those are on a different origin.
//
// Consumed by /wifi/ (gaming network test tool).
export const onRequestGet: PagesFunction = async (context) => {
  const headers = context.request.headers;

  const data: Record<string, string> = {
    ip: headers.get('CF-Connecting-IP') || '',
    country: headers.get('CF-IPCountry') || '',
    city: '',
    region: '',
    colo: '',
    asn: '',
    asOrg: '',
    timezone: '',
  };

  // The cf object on the request has richer geo/network data from Cloudflare's edge.
  // @ts-expect-error cf is available on Cloudflare Workers requests
  const cf = context.request.cf;
  if (cf) {
    data.city = cf.city || '';
    data.region = cf.region || '';
    data.country = cf.country || data.country;
    data.colo = cf.colo || '';
    data.asn = cf.asn ? String(cf.asn) : '';
    data.asOrg = cf.asOrganization || '';
    data.timezone = cf.timezone || '';
  }

  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
};
