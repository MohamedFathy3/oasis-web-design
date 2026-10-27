export const PUBLIC_SITE_ORIGIN = "https://viralzoom.agency";
const NON_CANONICAL_HOSTS = new Set([
  "viralzoom.tech",
  "www.viralzoom.tech",
  "www.viralzoom.agency",
]);

export function canonicalUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, PUBLIC_SITE_ORIGIN).toString();
}

export function redirectToCanonicalHost(request: Request): Response | null {
  const url = new URL(request.url);
  if (!NON_CANONICAL_HOSTS.has(url.hostname.toLowerCase())) return null;

  url.protocol = "https:";
  url.host = new URL(PUBLIC_SITE_ORIGIN).host;
  return Response.redirect(url, 308);
}

export function absoluteSiteAsset(path: string) {
  if (/^https:\/\//i.test(path)) return path;
  return canonicalUrl(path);
}
