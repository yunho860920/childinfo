export const TOSS_APP_ORIGINS = new Set([
  'https://myfirstinfantcare.apps.tossmini.com',
  'https://myfirstinfantcare.private-apps.tossmini.com'
]);

export function handleTossCors(req, res, methods) {
  const origin = req.headers?.origin;
  const isAllowedOrigin = TOSS_APP_ORIGINS.has(origin);
  const allowedMethods = [...new Set([...methods, 'OPTIONS'])].join(', ');

  // These endpoints may be CDN-cached. Always vary by Origin so a same-origin
  // response cannot be reused for a Toss request without its CORS headers.
  res.setHeader('Vary', 'Origin');

  if (isAllowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', allowedMethods);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method !== 'OPTIONS') return false;

  if (!isAllowedOrigin) {
    res.status(403).end();
    return true;
  }

  res.status(204).end();
  return true;
}
