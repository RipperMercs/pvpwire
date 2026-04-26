// Optional build-time RSS prefetch.
// At v1 the news feed is fetched at runtime from the Worker, so this script
// is a no-op stub. Reserved for v1.1 where we may pre-bake a JSON feed at build.

console.log('fetch-feeds: no-op (runtime feed served by Worker)');
