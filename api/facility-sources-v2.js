const SOURCE_CONFIG = Object.freeze({
  'community-child-centers': {
    url: 'https://api.data.go.kr/openapi/tn_pubr_public_local_child_center_api',
    keyParam: 'serviceKey',
    defaults: { type: 'json' },
    envName: 'BW_API_KEY'
  },
  'city-parks': {
    url: 'https://api.data.go.kr/openapi/tn_pubr_public_cty_park_info_api',
    keyParam: 'serviceKey',
    defaults: { type: 'json' },
    envName: 'BW_API_KEY'
  },
  'tour-api': {
    url: 'https://apis.data.go.kr/B551011/KorService2/areaBasedList2',
    keyParam: 'serviceKey',
    envName: 'TOUR_API_KEY',
    defaults: {
      MobileOS: 'ETC',
      MobileApp: 'Childinfo',
      _type: 'json',
      arrange: 'A'
    }
  },
  'hira-pediatrics': {
    url: 'https://apis.data.go.kr/B551182/hospInfoServicev2/getHospBasisList',
    keyParam: 'ServiceKey',
    defaults: { dgsbjtCd: '11' },
    envName: 'HIRA_API_KEY'
  }
});

function positiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const source = String(req.query.source || '');
  const config = SOURCE_CONFIG[source];
  if (!config) {
    return res.status(400).json({
      error: 'unsupported_source',
      supportedSources: Object.keys(SOURCE_CONFIG)
    });
  }

  const serviceKey = process.env[config.envName];
  if (!serviceKey) {
    return res.status(503).json({ error: 'public_data_api_not_configured' });
  }

  const pageNo = positiveInteger(req.query.pageNo, 1, 10000);
  const numOfRows = positiveInteger(req.query.numOfRows, 100, 1000);
  const upstreamUrl = new URL(config.url);
  upstreamUrl.searchParams.set(config.keyParam, serviceKey);
  upstreamUrl.searchParams.set('pageNo', String(pageNo));
  upstreamUrl.searchParams.set('numOfRows', String(numOfRows));
  for (const [key, value] of Object.entries(config.defaults)) {
    upstreamUrl.searchParams.set(key, value);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { Accept: 'application/json, application/xml;q=0.9, text/xml;q=0.8' },
      signal: AbortSignal.timeout(15000)
    });
    const body = await upstream.text();

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/plain; charset=utf-8');
    res.setHeader('X-Childinfo-Source', source);
    return res.status(upstream.status).send(body);
  } catch (error) {
    console.error(`Facility V2 source proxy failed (${source}):`, error?.message || error);
    return res.status(502).json({ error: 'facility_source_failed', source });
  }
}
