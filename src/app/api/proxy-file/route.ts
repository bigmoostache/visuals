import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side proxy for fetching a file URL. Used only for Spengler file URLs
 * (spengler.deepdocs.net, files-spengler.deepdocs.net) when the KB is opened
 * on vis.deepdocs.net, to avoid CORS. App and medacta are not proxied.
 */
export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get('url');
  if (!urlParam) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: 'Invalid url parameter' }, { status: 400 });
  }

  const host = targetUrl.hostname.toLowerCase();
  if (!host.includes('spengler.deepdocs.net')) {
    return NextResponse.json({ error: 'Proxy only allowed for Spengler URLs' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(targetUrl.protocol)) {
    return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 });
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: { Accept: 'application/json, application/octet-stream, */*' },
      cache: 'no-store',
    });

    if (!res.ok) {
      return new NextResponse(res.body, {
        status: res.status,
        statusText: res.statusText,
      });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('Proxy fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 });
  }
}
