export async function fetchWithTimeout(
  input,
  init = {},
  timeoutMs = 15000,
  fetchImpl = globalThis.fetch,
) {
  const controller = new AbortController();
  const safeTimeoutMs = Math.max(1, Number(timeoutMs) || 15000);
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, safeTimeoutMs);

  try {
    return await fetchImpl(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (didTimeout) {
      const timeoutError = new Error('요청 시간이 초과되었습니다.');
      timeoutError.name = 'TimeoutError';
      timeoutError.code = 'REQUEST_TIMEOUT';
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
