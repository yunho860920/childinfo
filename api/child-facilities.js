const FACILITY_API_URL = 'https://apis.data.go.kr/B554287/sclWlfrFcltInfoInqirService1/getFcltListInfoInqire';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const serviceKey = process.env.BW_API_KEY;
  if (!serviceKey) {
    return res.status(503).json({ error: 'facility_api_not_configured' });
  }

  const pageNo = Number.parseInt(req.query.pageNo || '1', 10);
  const numOfRows = Number.parseInt(req.query.numOfRows || '200', 10);
  const safePageNo = Number.isFinite(pageNo) && pageNo > 0 && pageNo <= 100 ? pageNo : 1;
  const safeNumOfRows = Number.isFinite(numOfRows) && numOfRows > 0 && numOfRows <= 200 ? numOfRows : 200;

  const upstreamUrl = new URL(FACILITY_API_URL);
  upstreamUrl.searchParams.set('serviceKey', serviceKey);
  upstreamUrl.searchParams.set('pageNo', String(safePageNo));
  upstreamUrl.searchParams.set('numOfRows', String(safeNumOfRows));
  upstreamUrl.searchParams.set('_type', 'json');

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
    console.error('Facility API proxy failed:', error?.message || error);
    return res.status(502).json({ error: 'facility_api_failed' });
  }
}
