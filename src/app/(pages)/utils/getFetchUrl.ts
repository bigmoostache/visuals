/**
 * Use proxy only when (1) we're on vis.deepdocs.net and (2) file URL is Spengler.
 * Avoids CORS; app/medacta/septodon unchanged.
 */
export function getFetchUrl(fileUrl: string | null): string {
  if (!fileUrl) return '';
  if (typeof window === 'undefined') return fileUrl;
  try {
    const target = new URL(fileUrl);
    const fileHost = target.hostname.toLowerCase();
    const pageHost = window.location.hostname.toLowerCase();
    if (pageHost.includes('vis.deepdocs.net') && fileHost.includes('spengler.deepdocs.net')) {
      return `/api/proxy-file?url=${encodeURIComponent(fileUrl)}`;
    }
  } catch {
    // invalid URL, use as-is
  }
  return fileUrl;
}
