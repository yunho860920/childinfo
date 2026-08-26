const TOSS_APP_HOSTS = new Set([
  'myfirstinfantcare.apps.tossmini.com',
  'myfirstinfantcare.private-apps.tossmini.com'
]);

export const CHILDINFO_API_ORIGIN = 'https://childinfo.vercel.app';

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/+$/, '');
}

export function getApiUrl(path, hostname = globalThis.location?.hostname || '') {
  const normalizedPath = String(path || '').startsWith('/') ? String(path) : `/${path}`;
  const configuredOrigin = normalizeOrigin(
    typeof import.meta.env === 'object' ? import.meta.env.VITE_API_BASE_URL : '',
  );
  const apiOrigin = configuredOrigin || (TOSS_APP_HOSTS.has(hostname) ? CHILDINFO_API_ORIGIN : '');
  return `${apiOrigin}${normalizedPath}`;
}
