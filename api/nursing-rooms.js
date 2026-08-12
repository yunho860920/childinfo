const NURSING_API_URL = 'https://sooyusil.com/api/nursingRoomJSON.do';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const confirmApiKey = process.env.NURSING_API_KEY;
  if (!confirmApiKey) {
    return res.status(503).json({ error: 'nursing_api_not_configured' });
  }

  const upstreamUrl = new URL(NURSING_API_URL);
  upstreamUrl.searchParams.set('confirmApiKey', confirmApiKey);

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    });

    const body = await upstream.text();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.status(upstream.status).send(body);
  } catch (error) {
    console.error('Nursing API proxy failed:', error?.message || error);
    return res.status(502).json({ error: 'nursing_api_failed' });
  }
}
