import test from 'node:test';
import assert from 'node:assert/strict';
import { CHILDINFO_API_ORIGIN, getApiUrl } from '../src/services/apiUrl.js';
import { handleTossCors } from '../server/cors.js';

function createResponse() {
  const headers = new Map();
  return {
    headers,
    statusCode: null,
    ended: false,
    setHeader(name, value) {
      headers.set(name.toLowerCase(), value);
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    }
  };
}

test('Toss live and private origins use the Vercel API origin', () => {
  assert.equal(
    getApiUrl('/api/ai-guide', 'myfirstinfantcare.apps.tossmini.com'),
    `${CHILDINFO_API_ORIGIN}/api/ai-guide`
  );
  assert.equal(
    getApiUrl('/api/nursing-rooms', 'myfirstinfantcare.private-apps.tossmini.com'),
    `${CHILDINFO_API_ORIGIN}/api/nursing-rooms`
  );
});

test('web and local hosts keep API requests same-origin', () => {
  assert.equal(getApiUrl('/api/ai-guide', 'childinfo.vercel.app'), '/api/ai-guide');
  assert.equal(getApiUrl('api/ai-guide', 'localhost'), '/api/ai-guide');
});

test('allowed Toss preflight returns CORS headers and 204', () => {
  const req = {
    method: 'OPTIONS',
    headers: { origin: 'https://myfirstinfantcare.private-apps.tossmini.com' }
  };
  const res = createResponse();

  assert.equal(handleTossCors(req, res, ['POST']), true);
  assert.equal(res.statusCode, 204);
  assert.equal(res.ended, true);
  assert.equal(
    res.headers.get('access-control-allow-origin'),
    'https://myfirstinfantcare.private-apps.tossmini.com'
  );
  assert.equal(res.headers.get('access-control-allow-methods'), 'POST, OPTIONS');
});

test('unknown origins cannot preflight the API', () => {
  const req = { method: 'OPTIONS', headers: { origin: 'https://example.com' } };
  const res = createResponse();

  assert.equal(handleTossCors(req, res, ['GET']), true);
  assert.equal(res.statusCode, 403);
  assert.equal(res.headers.has('access-control-allow-origin'), false);
  assert.equal(res.headers.get('vary'), 'Origin');
});

test('same-origin cache entries still vary by Origin', () => {
  const req = { method: 'GET', headers: {} };
  const res = createResponse();

  assert.equal(handleTossCors(req, res, ['GET']), false);
  assert.equal(res.headers.get('vary'), 'Origin');
  assert.equal(res.headers.has('access-control-allow-origin'), false);
});
