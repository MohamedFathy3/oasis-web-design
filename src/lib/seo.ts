export const PUBLIC_SITE_ORIGIN = "https://viralzoom.agency";

export function canonicalUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, PUBLIC_SITE_ORIGIN).toString();
}

export function absoluteSiteAsset(path: string) {
  if (/^https:\/\//i.test(path)) return path;
  return canonicalUrl(path);
}
